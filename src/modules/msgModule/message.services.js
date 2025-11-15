import userModel from "../../DB/models/user.model.js";
import messageModel from "../../DB/models/message.model.js";
import { successHandler } from "../../utils/successHandler.js";


export const sendMessage = async (req, res) => {
    const {to , content} = req.body;

    const receiver = await userModel.findById(to);
    if(!receiver){
        return res.status(404).json({ errMsg: "Receiver not found", status: 404 });
    }

    const from = req.params.from;
    const data = {
        to,
        content
    }
    if(from){
        const sender = await userModel.findById(from);
        if(!sender){
            return res.status(404).json({ errMsg: "Sender not found", status: 404 });
        }
        data.from = sender._id;
    }

    const message = await messageModel.create(data)

    return successHandler({ res, data: { message }, status: 200, msg: "Message sent successfully" })
}


export const getAllMessages = async (req, res) => {
    const user = req.user; 
    const messages = await messageModel.find({to:user._id}).select('-to').populate([{
        path: 'from',
        select: 'firstName lastName email'
    }]);
    return successHandler({ res, data: { messages }, status: 200, msg: "Messages retrieved successfully" })
}

export const getMessage = async (req, res) => {
    const messageId = req.params.id; 
    const messages = await messageModel.findOne({_id: messageId , to: req.user._id}).select('-to').populate([{
        path: 'from',
        select: 'firstName lastName email'
    }]);
    if(!messages){
        return res.status(404).json({ errMsg: "Message not found", status: 404 });
    }
    return successHandler({ res, data: { messages }, status: 200, msg: "Messages retrieved successfully" })
}

export const deleteMessage = async (req, res) => {
    const {id} = req.params;
    const message = await messageModel.findOne({_id: id , to: req.user._id})
    if(!message){
        return res.status(404).json({ errMsg: "Message not found", status: 404 });
    }
    await message.deleteOne();
    return successHandler({ res, data: null, status: 200, msg: "Message deleted successfully" })
}

export const getUserMessages = async (req, res) => {
    const {id} = req.params;
    const messages = await messageModel.find({to: id})
    return successHandler({ res, data: { messages }, status: 200, msg: "User messages retrieved successfully" })
}