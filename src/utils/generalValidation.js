import Joi from "joi";
import { Gender, Role } from "../DB/models/user.model.js";
import mongoose from "mongoose";
import { allowedMimeTypes } from "./multer/multer.local.js";


const checkId = (value, helpers) => {
    if (mongoose.isValidObjectId(value)) {
        return value; // return the value, not true
    } else {
        return helpers.message("Invalid user id format")
    }
}



export const generalValidation = {
    firstName: Joi.string().min(2).max(15),
    lastName: Joi.string().min(2).max(15),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(20),
    confirmPassword: Joi.ref('password'),
    age: Joi.number().min(16).max(50),
    gender: Joi.string().valid(Gender.male, Gender.female),
    role: Joi.string().valid(Role.user, Role.admin),
    phone: Joi.string().regex(/^01[0125][0-9]{8}$/).message("Phone must be Egyptian mobile number"),
    otp: Joi.string().length(6),
    id: Joi.custom(checkId),
    fieldname: Joi.string().valid('image'),
    originalname: Joi.string(),
    encoding: Joi.string(),
    mimetype: Joi.string().valid(...allowedMimeTypes.image),
    destination: Joi.string(), // ✅ أضفت هنا
    filename: Joi.string(),
    path: Joi.string(),
    size: Joi.number().max(10 * 1024 * 1024), // 10MB
}

