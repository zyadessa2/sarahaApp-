import Joi from "joi";
import { generalValidation } from "../../utils/generalValidation.js";


export const getUserByIdSchema = Joi.object().keys({
   id: generalValidation.id.required()
});


export const updateBasicInfoSchema = Joi.object().keys({
    firstName: generalValidation.firstName,
    lastName: generalValidation.lastName,
    age: generalValidation.age,
    phone: generalValidation.phone
})


export const profileImageSchema = Joi.object().keys({
    fieldname: generalValidation.fieldname.required(),
    originalname: generalValidation.originalname.required(),
    encoding: generalValidation.encoding.required(),
    mimetype: generalValidation.mimetype.required(),
    filename: generalValidation.filename,
    destination: generalValidation.destination,
    path: generalValidation.path,
    size: generalValidation.size.required(), // 10MB
    buffer: Joi.binary()
})