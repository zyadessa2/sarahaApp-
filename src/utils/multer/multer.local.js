import multer , {diskStorage, memoryStorage} from "multer";
import { nanoid } from "nanoid";
import fs from "fs/promises";

export const allowedMimeTypes = {

    image:['image/jpeg', 'image/png','image/jpg', 'image/gif', 'image/webp'],
    video:['video/mp4'],
}

export const localUploadFile = (folderName = 'general' , type = allowedMimeTypes.image)=>{
// {
//         destination: async (req , file , cb) =>{
//             if (!req.user) {
//                 return cb(new Error("User not authenticated"), null);
//             }
            
//             const folder = `uploads/${folderName}/${req.user.firstName}`;
            
//             try {
//                 await fs.access(folder);
//                 cb(null, folder);
//             } catch (error) {
//                 try {
//                     await fs.mkdir(folder, { recursive: true });
//                     cb(null, folder);
//                 } catch (mkdirError) {
//                     cb(mkdirError, null);
//                 }
//             }
//         },
//         filename: (req , file , cb) =>{
//             cb(null , `${nanoid(10)}-${file.originalname}`);
//         }
//     }
    const storage = memoryStorage() // Use memory storage for local uploadmin ram not in disk

    const fileFilter = (req , file , cb) =>{
        if(!type.includes(file.mimetype)){
            return cb(new Error('Invalid file type. Only image files are allowed.'), false);
        } 
        return cb(null , true);
    }

    return multer({storage , fileFilter});
}