import Joi from "joi";
import { Gender, Role } from "../../DB/models/user.model.js";
import { generalValidation } from "../../utils/generalValidation.js";


export const signupSchema = Joi.object().keys({
    firstName: generalValidation.firstName.required(),
    lastName: generalValidation.lastName.required(),
    email: generalValidation.email.required(),
    password: generalValidation.password.required(),
    confirmPassword: generalValidation.confirmPassword,
    age: generalValidation.age,
    gender: generalValidation.gender,
    role: generalValidation.role,
    phone: generalValidation.phone
}).required()


export const loginSchema = Joi.object().keys({
    email: generalValidation.email.required(),
    password: generalValidation.password.required()
}).required();



export const confirmEmailSchema = Joi.object().keys({
    email: generalValidation.email.required(),
    otp: generalValidation.otp.required()
}).required();


export const resendOTPSchema = Joi.object().keys({
    email: generalValidation.email.required()
}).required();