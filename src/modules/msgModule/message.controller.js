import { Router } from "express";
import * as messageServices from "./message.services.js";
import { auth } from "../../middleware/auth.middleware.js";

const router = Router({
    mergeParams: true
});



router.post('/sendMessage{/:from}', messageServices.sendMessage)
router.get('/getAllMessages', auth() ,messageServices.getAllMessages)
router.get('/getMessage/:id', auth() ,messageServices.getMessage)
router.delete('/deleteMessage/:id', auth() ,messageServices.deleteMessage)  
router.get('/' , messageServices.getUserMessages)

export default router;