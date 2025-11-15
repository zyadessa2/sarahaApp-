import cloudinary from "./cloudConfig.js";



export const uploadSingleFile = async({path , buffer , dest = ""}) => {
    // If buffer is provided, use upload_stream, otherwise use upload (for file path)
    if(buffer){
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: `${process.env.cloudFolder}/${dest}` },
                (error, result) => {
                    if (error) reject(error);
                    else resolve({ secure_url: result.secure_url, public_id: result.public_id });
                }
            );
            uploadStream.end(buffer);
        });
    } else {
        const {secure_url , public_id} = await cloudinary.uploader.upload(path , { 
            folder: `${process.env.cloudFolder}/${dest}` 
        })
        return {secure_url , public_id};
    }
}

export const deleteSingleFile = async({public_id})=>{
    await cloudinary.uploader.destroy(public_id)
}


export const uploadMultipleFiles = async({paths = [] , dest = ""}) => {
    if(paths.length == 0 ){
        throw new Error("No files to upload");
    }

    const images = []
    for (const path of paths) {
        const {public_id , secure_url} = await uploadSingleFile({path , dest:`${process.env.cloudFolder}/${dest}` })
        images.push({public_id , secure_url})
    }
    return images;
}


export const deleteByPrefix = async({prefix = ""})=>{
    await cloudinary.api.delete_resources_by_prefix(prefix);
}

export const deleteByFolder = async({folder = ""})=>{
    await cloudinary.api.delete_folder(folder);
}