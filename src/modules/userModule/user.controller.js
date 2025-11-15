import { Router } from "express";
import {  coverImages, DeleteUser, getProfile, getUserById, profileImage, restoreUser, shareProfile, softDeleteUser, updateBasicInfo } from "./user.services.js";
import { validation } from "../../middleware/validation.middleware.js";
import { getUserByIdSchema, profileImageSchema, updateBasicInfoSchema } from "./user.validatio.js";
import { allowTo, auth } from "../../middleware/auth.middleware.js";
import { Role } from "../../DB/models/user.model.js";
// import { uploadFile } from "../../utils/multer/multer.js";
import { uploadToCloud } from "../../utils/multer/multer.cloud.js";
import { storeFile } from "../../middleware/storeFile.middleware.js";
import messageRouter from "../msgModule/message.controller.js";
const router = Router();

router.use('/getUser/:id/messages', messageRouter)

router.get('/shareProfile', auth(), shareProfile);
router.patch('/softDelete/:id', auth(), allowTo(Role.admin), softDeleteUser);
router.patch('/restoreUser/:id', auth(), allowTo(Role.admin), restoreUser);
router.delete('/hardDelete/:id', auth(), DeleteUser);
router.get('/:id', validation(getUserByIdSchema), getProfile);

router.patch('/updateBasicInfo', validation(updateBasicInfoSchema), auth(), updateBasicInfo);

router.patch('/profileImage',
    auth(),
    uploadToCloud().single('image'),
    validation(profileImageSchema),
    storeFile('profileImages'),
    profileImage
);

router.patch('/coverImages',
    auth(),
    uploadToCloud().array('coverImages', 5),
    coverImages
)

router.get('/getUser/:id', getUserById);

export default router;