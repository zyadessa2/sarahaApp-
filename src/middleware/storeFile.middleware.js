import fs from 'fs/promises';

const handleFilePath = async (file , path) =>{
    const folderName = `uploads/${path}`

    await fs.access(folderName).catch( async ()=>{
        await fs.mkdir(folderName , {recursive:true})
    })

    return `${folderName}/${file.originalname}`;
}



export const storeFile = (path = 'general')=>{

    return  async (req , res , next) =>{
        const file = req.file;
        const filePath = await handleFilePath(file , path);
        const buffer = file.buffer;
        await fs.writeFile(  filePath , buffer);
        next();
    }

}