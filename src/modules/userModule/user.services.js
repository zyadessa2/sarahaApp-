import userModel from "../../DB/models/user.model.js";
import { deleteByFolder, deleteSingleFile, uploadMultipleFiles, uploadSingleFile } from "../../utils/multer/cloud.services.js";
import cloudinary from "../../utils/multer/cloudConfig.js";
import { successHandler } from "../../utils/successHandler.js";
import fs from "fs/promises";

// export const getUserProfile = async (req, res, next) => {
//     try {
//         const { id } = req.params; // من URL parameters
        
//         const user = await userModel.findById(id);
//         if (!user) {
//             return res.status(404).json({ errMsg: "User not found", status: 404 });
//         }
        
//         successHandler({ res, data: { user }, status: 200, msg: "User profile retrieved successfully" });
//     } catch (error) {
//         return next(error);
//     }
// }


export const updateBasicInfo = async (req, res, next) => {
    const {firstName, lastName , age , phone} = req.body;

    const user = req.user;

    user.age = age || user.age;
    user.phone = phone || user.phone;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    await user.save();
    return successHandler({ res, data: { user }, status: 200, msg: "User info updated successfully" })
}


export const shareProfile = async (req, res, next) => {
    const user = req.user;
    const link = `${req.protocol}://${req.host}/users/${user._id}`;
    return successHandler({ res, data: { link }, status: 200, msg: "Profile link generated successfully" })
}

export const getProfile = async (req, res, next) => {
    const id = req.params.id;
    const user = await userModel.findOne({  // كان findone - صححته لـ findOne
        _id: id,
        isDeleted: false
    }).select("firstName lastName email age phone profileImage");
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    user.profileImage = `${req.protocol}://${req.host}/${user.profileImage}`;
    return successHandler({ res, data: { user }, status: 200, msg: "User profile retrieved successfully" })
}

export const softDeleteUser = async (req, res, next) => {
    const {id} = req.params;
    const user = await userModel.findOne({  // لازم اقولو فايند وان عشان اقدر اععمل كونديشن ان لازم ميكنش ممسوح عشان اعرف اسيرش عليه
        isDeleted: false,
        _id: id
    });
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    if (user.role === "admin") {
        return res.status(400).json({ errMsg: "Cannot delete an admin user", status: 400 });
    }
    user.isDeleted = true;
    user.DeletedBy = req.user._id;
    await user.save();
    return successHandler({ res, status: 200, msg: "User soft deleted successfully" })
}


export const restoreUser = async (req, res, next) => {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    if(!user.isDeleted){
        return res.status(400).json({ errMsg: "User is not deleted", status: 400 });
    }

    if(user.DeletedBy.toString() !== req.user._id.toString()){
        return res.status(403).json({ errMsg: "You cannot restore a user you didn't delete", status: 403 });
    }

    user.DeletedBy = undefined
    user.isDeleted = false;
    await user.save();
    return successHandler({ res, status: 200, msg: "User restored successfully" })
}

export const DeleteUser = async (req, res, next) => {
    try {
        const user = req.user;
        
        // حذف الصور من Cloudinary إذا كانت موجودة
        if(user.profileImage || (user.coverImages && user.coverImages.length > 0)){
            console.log('Attempting to delete user files from Cloudinary...');
            await deleteByFolder({folder: `${process.env.cloudFolder}/users/${user._id}`});
            console.log('Files deleted successfully');
        }

        await user.deleteOne();
        return successHandler({ res, status: 200, msg: "User deleted successfully" });
    } catch (error) {
        console.log('Error in DeleteUser:', error);
        return next(error);
    }
}


export const profileImage = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ errMsg: "No image file uploaded", status: 400 });
    }

    // // التحقق من نوع الملف
    // const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    // if (!allowedMimeTypes.includes(req.file.mimetype)) {
    //     // حذف الملف المرفوع
    //     await fs.unlink(req.file.path);
    //     return res.status(400).json({ 
    //         errMsg: "Invalid file type. Only JPEG, PNG, JPG, and WEBP images are allowed", 
    //         status: 400 
    //     });
    // }

    // // التحقق من حجم الملف (5MB)
    // const maxSize = 5 * 1024 * 1024; // 5MB
    // if (req.file.size > maxSize) {
    //     await fs.unlink(req.file.path);
    //     return res.status(400).json({ 
    //         errMsg: "File size too large. Maximum size is 5MB", 
    //         status: 400 
    //     });
    // }

    const buffer = req.file.buffer;
    const user = req.user;

    const {secure_url , public_id} = await uploadSingleFile({buffer:buffer , dest: `users/${user._id}/profileImages`});
    
    if(user.profileImage?.public_id){
        await deleteSingleFile({public_id: user.profileImage.public_id})

    }

    user.profileImage = {
        secure_url,
        public_id
    }
    await user.save();



    // حذف الصورة القديمة إن وجدت
    // if (user.profileImage) {
    //     try {
    //         await fs.unlink(user.profileImage);
    //     } catch (error) {
    //         // تجاهل الخطأ إذا كان الملف غير موجود
    //         console.log('Old profile image not found or already deleted');
    //     }
    // }
    
    
    return successHandler({ 
        res, 
        data: { profileImage: secure_url },
        status: 200, 
        msg: "Profile image updated successfully" 
    });
}


export const coverImages = async (req, res, next) => {
    const user = req.user;
    const files = req.files;
    const paths = []
    req.files.map(file=>{
        paths.push(file.path);
    })

    const coverImages = await uploadMultipleFiles({paths: paths , dest: `users/${user._id}/coverImages`})

    user.coverImages.push(...coverImages); // لو عاوز اضيف صور على الصور القديمه
    await user.save();
    return successHandler({ res, data: { coverImages }, status: 200, msg: "Cover images updated successfully" })

}


export const getUserById = async (req, res, next) => {
    const {id} = req.params;
    const user = await userModel.findById(id)
    return successHandler({ res, data: user, status: 200, msg: "User retrieved successfully" })
}