import multer , {diskStorage} from "multer";
import { nanoid } from "nanoid";
import fs from "fs/promises";

export const allowedMimeTypes = {

    image:['image/jpeg', 'image/png','image/jpg', 'image/gif', 'image/webp'],
    video:['video/mp4'],
}

export const uploadToCloud = ( type = allowedMimeTypes.image)=>{

    // const storage = diskStorage({})
    const storage = multer.memoryStorage();

    const fileFilter = (req , file , cb) =>{
        if(!type.includes(file.mimetype)){
            return cb(new Error('Invalid file type. Only image files are allowed.'), false);
        } 
        return cb(null , true);
    }

    return multer({storage , fileFilter});
}