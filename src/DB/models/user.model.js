import { get, model , Schema, set, Types } from "mongoose";
import { decrypt, encrypt } from "../../utils/crypto.js";
import { compare, hash } from "../../utils/bcrytp.js";
import { profileImage } from "../../modules/userModule/user.services.js";


export const Gender = {
    male: "male",
    female: "female"
}
Object.freeze(Gender); // to make the object immutable

export const Role = {
    user: "user",
    admin: "admin"
}
Object.freeze(Role);

const otpSchema = new Schema({
    otp: String,
    expiredAt: Date
}, 
{ _id: false })

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        set(value){
            return hash(value)
        },
        
    },
    age: {
        type: Number,
        min: 20,
        max: 50,
    },
    gender: {
        type: String,
        enum: Object.values(Gender), // to get all values of the object gender
        default: Gender.male
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.user
    },
    phone:{
        type: String,
        required: true,
        set(value){
            if(value) return encrypt(value)
            return value
        },
        get(value){
            return decrypt(value)
        }
    },
    confirmed:{
        type: Boolean,
        default: false
    },
    
    emailOtp: otpSchema,
    newEmailOtp: otpSchema,
    oldEmailOtp: otpSchema,
    passwordOtp: otpSchema,
    pendingEmail: String,
    changedCredentialsAt: {
        type: Date
    },

    isDeleted:{
        type: Boolean,
        default: false
    },
    DeletedBy:{
        type: Types.ObjectId,
        ref: "user"
    },
    profileImage: {
        secure_url: String,
        public_id: String
    },
    coverImages: [{
        secure_url: String,
        public_id: String
    }]
},
    { 
        timestamps: true ,
        toJSON: { getters: true }, // to apply the get function when converting to JSON
        toObject: { getters: true }, // to apply the get function when converting to Object
        virtuals:{
            fullName:{
                get(){
                    return this.firstName + " " + this.lastName
                }
            }
        },

        methods:{
            checkPassword(password){
                return compare(password, this.password)
            }
        }
    }
)

const userModel = model("user", userSchema);
export default userModel;

