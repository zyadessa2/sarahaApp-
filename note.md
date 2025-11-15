
## week11 - session 1 ##

- we create DBservices file in DB folder to put all model and services in it becase if i want to change the orm i will just update this file 


import { userModel } from "./models/user.model";

export const findOne = async ({model , filter = {}}) =>{
    const doc = await model.findOne(filter)
    return doc;
}

export const findById = async ({model , id}) =>{
    const doc = await model.findById(id)
    return doc;
}

export const find = async ({model , filter = {}}) =>{
    const docs = await model.find(filter)
    return docs;
}


export const create = async ({model , data}) =>{
    const docs = await model.create(data)
    return docs;
}

export const findByIdAndUpdate = async ({model , id , data={} , options = {new: true}}) =>{
    const doc = await model.findByIdAndUpdate(id , data , options)
    return doc;
}

export const findOneAndUpdate = async ({model , filter= {} , data={} , options = {new: true}}) =>{
    const doc = await model.findOneAndUpdate(filter , data , options)
    return doc;
}

export const findByIdAndDelete = async ({model , id  }) =>{
    const doc = await model.findByIdAndDelete(id  )
    return doc;
}

export const findOneAndDelete = async ({model , filter= {}  }) =>{
    const doc = await model.findOneAndDelete(filter )
    return doc;
}

=======================
======================

## week 11 - session 2 ##

 - V1 (npm i crypto-js)

    crypto-js بنستخدم مكتبه  عشان نعمل تشفير

    import { encrypt } from "../../utils/crypto.js";
    import { decrypt } from "dotenv";

---------

// هنا عملت تشفير لرقم الهاتف
export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, age, gender, role, phone } = req.body;

    const isExist = await findOne({ model: userModel, filter: { email } });
    if (isExist) return next(new NotValidEmailExeption());

    const user = await create({ model: userModel, data: { firstName, lastName, email, password, age, gender, role, phone: encrypt(phone) } });

    return successHandler({ res, data: user, status: 201, msg: "user created" });
}

---------

 وهنا فكيت التشفير ونا بجيب الداتا لليوزر 
export const getUserProfile = async (req, res, next) => {
    const user = req.user
    user.phone = decrypt(user.phone)
    successHandler({ res, data: user, status: 200, msg: "User profile retrieved successfully" })
}

----------

ودا الفايل بتتاع الكربتو كان فى فولدر اليوتلز 
import CryptoJS from "crypto-js";

export const encrypt = (data ) => {
    return CryptoJS.AES.encrypt(data , process.env.CRYPTO_JS).toString()
}

export const decrypt = (data ) => {
    const bytes = CryptoJS.AES.decrypt(data , process.env.CRYPTO_JS);
    return bytes.toString(CryptoJS.enc.Utf8);
}
 

 - V2 setter & getter

 انا عاوز استخدم السيتر والجيتر فى اليوزر مودل عشان اعمل الانكريبشن بدل ما استخدمو فى اليوزر سيرفزيس 

 // بعمل بالطريقه دى 
 phone:{
        type: String,
        required: true,
        set(value){
            return encrypt(value)
        },
        get(value){
            return decrypt(value)
        }
    }

// ولازم اعرف الموديل على الجيتر زى كده 

{ 
        timestamps: true ,
        toJSON: { getters: true }, // to apply the get function when converting to JSON
        toObject: { getters: true } // to apply the get function when converting to Object

    }

// لو عاوز ادمج حاجتين مع بعض زى الاسم الاول والاسم التانى بعملو بالطريقه دى فالموديل 

virtuals:{
            fullName:{
                get(){
                    return this.firstName + " " + this.lastName
                }
            }
        }



 - V3 Methods:

// ازاى اعمل ميثود 
        methods:{
            userName(){
                if(this.firstName == "ziad"){
                    return "admin"
                }else{
                    return "user"
                }
            }
        }

// وبستخدمها فى اى مكان وبنادى عليها من خلال الموديل الى عملتو فيها 
 {
    user.userName()
 }


 - V4 Hashing password  (npm i bcryptjs)
  
// انا عملت فايل اسمو bcrypt.js 
الفايل دا هحط فيه الموسود بتوع الهاش 

import bcrypt from "bcryptjs";

export const hash = (password)=>{
    return bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS))
}

export const compare = (text, hashedPassword) => {
    return bcrypt.compareSync(text, hashedPassword)
}

// وبروح لليوزر موديل بعمل هشا للباوورد وبعمل ميثود عشان تفك الهاش 

password: {
        type: String,
        required: true,
        set(value){
            return hash(value)
        },
        
    },

======

methods:{
            checkPassword(password){
                return compare(password, this.password)
            }
        }

// وفى اللوجن بعمل الكونديشن دا عشان اقارن بين الباوورد 

    if (!user || !user.checkPassword(password)) return next(new InvalidCradentialsExeption());



================================================

## week 12 session-1 ##

 - email confirmed (npm i nodemailer)

// احنا عاوزين نعمل فانكشن بتبعت ايميل فيه otp لما يعمل ساين اب 

  -اول حاجه نعدل على الساين اب -
export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, age, gender, role, phone } = req.body;

    const isExist = await findOne({ model: userModel, filter: { email } });
    if (isExist) return next(new NotValidEmailExeption());

    const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    const subject = "Verify your email";
    const html = template(otp , firstName, subject);

    const user = await create({ model: userModel, data: { firstName, lastName, email, password, age, gender, role, phone , emailOtp: { otp: hashSync(otp), expiredAt: Date.now() + 10 * 60 * 1000 } } });

    await sendEmail({ to: user.email, subject, html });

    return successHandler({ res, data: user, status: 201, msg: "user created" });
}
  
  -نعدل على الموديل - 
  confirmed:{
        type: Boolean,
        default: false
    },
    emailOtp:{
        otp: {
            type: String
        },
        expiredAt: {
            type: Date
        }
    }

  -  - code expire -  هنعمل فانكشن لى الكونفيرم ايميل ونعملهها api -

  export const confirmEmail = async (req, res, next) => {
    const {otp , email} = req.body;
    const user = await findByEmail({model: userModel , email});
    if (!user) return next(new NotValidEmailExeption());
    
    if(user.emailOtp.expiredAt < Date.now()) return next (new InvalidOTPExeption());
    if (!user.emailOtp.otp) throw new Error("No OTP found." , {cause: 409});
    if (!compare(otp, user.emailOtp.otp)) return next (new InvalidOTPExeption());
    await user.updateOne({ confirmed: true, $unset: { emailOtp: "" } });
    return successHandler({res , data: user , status: 200 , msg: "Email confirmed successfully"});
}

router.post("/confirmEmail", authServices.confirmEmail)

  - هنعمل فولدر فى اليوتيلز هنسميه سيند ايميل وهيبقى جواه الفانكشن الى بتعت الايميل والكود بتاع ال html-
  
  import nodemailer from 'nodemailer';

export const sendEmail = async ({to , subject , html})=>{
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure:  'true', // true for 465, false for 587
        auth:{
            user: process.env.USER,
            pass: process.env.PASS
        }
    })
    const main = async ()=>{
        const info = await transporter.sendMail({
            from: '"sarahaApp 👻" <foo@example.com>',
            to,
            subject,
            html
        })
        console.log({info});
        
    }
    main().catch((err)=>console.log({emailError:  err}));
}

--------
export const template = (otp, name, subject) => `<!DOCTYPE html>
<!-- <html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .email-header {
      background-color: #007BFF;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }
    .email-body {
      padding: 20px;
      color: #333333;
      line-height: 1.6;
    }
    .email-body h2 {
      margin-top: 0;
      color: #007BFF;
    }
    .activation-button {
      display: inline-block;
      background-color: #007BFF;
      color: #ffffff !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 16px;
      margin: 20px 0;
    }
    .activation-button:hover {
      background-color: #0056b3;
    }
    .email-footer {
      text-align: center;
      padding: 15px;
      background-color: #f4f4f4;
      font-size: 14px;
      color: #777777;
    }
    .email-footer a {
      color: #007BFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>
    <div class="email-body">
      <h2>Hello ${name},</h2>
      <p>Thank you for signing up with Route Academy. To complete your registration and start using your account, please get code to ${subject}</p>
      <h2 class="activation-button">${otp}</h2>
      <p>If you did not sign up for this account, please ignore this email.</p>
      <p>Best regards,<br>Social Media Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2024 Route Academy. All rights reserved.</p>
      <p><a href="[SupportLink]">Contact Support</a> | <a href="[UnsubscribeLink]">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`; -->


    - forget password and reset password
  
  export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());
    if(!user.confirmed) return next(new Error("Email not confirmed yet", { cause: 400 }));
    if(user.passwordOtp.expiredAt > Date.now()) return next(new Error("Previous OTP not expired yet", { cause: 400 }));

    const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    const subject = "Reset your password (forget password)";
    const html = template(otp , user.firstName, subject);
    await sendEmail({ to: user.email, subject, html });
    await user.updateOne({ passwordOtp: { otp: hashSync(otp), expiredAt: Date.now() + 10 * 60 * 1000 } });

    return successHandler({ res, data: user, status: 200, msg: "Forget password OTP sent to your email" });

}

export const changePassword = async (req, res, next) => {
    const { otp, email, newPassword } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());
    if (!user.passwordOtp.otp) throw new Error("No OTP found." , {cause: 409});
    if(user.passwordOtp.expiredAt < Date.now()) return next (new InvalidOTPExeption());
    if (!compare(otp, user.passwordOtp.otp)) return next (new InvalidOTPExeption());
    
    await user.updateOne({ password : newPassword, $unset: { passwordOtp: "" } });

    return successHandler({ res, data: user, status: 200, msg: "Password changed successfully" });

}

// هنغير فى اليوزر مودل 
 passwordOtp:{
        otp: {
            type: String
        },
        expiredAt: {
            type: Date
        }
    }



--------------------  \

انا عاوز لما اعمل تغيير كلمه المرور يسجل خروج من كل الجلسات القديمه او يوقع التوكنز القديمه 
(هعمل كده ب انى هعمل حاجه جديده فالمودل هسميها changedCredentialsAt: {
        type: Date
    }  وهروح احدثها فى الفانكشن بتاعه ابظيت باسوورد واخليها تاخد الوقت الى الباسوورد اتحدث فيه )

        await user.updateOne({ password: newPassword, $unset: { passwordOtp: "" }, changedCredentialsAt: Date.now() });


وبعيدين هروح اشوف الجلسات القجيديمه الوقت بتاعه امته ولو اقل الغيها 

    if(user.changedCredentialsAt?.getTime() > data.iat * 1000){
        throw new InvalidTokenExeption()
    }



--------------------------

 ## share profile ## 

    
export const shareProfile = async (req, res, next) => {
    const user = req.user;
    const link = `${req.protocol}://${req.host}/users/${user._id}`;
    return successHandler({ res, data: { link }, status: 200, msg: "Profile link generated successfully" })
}

export const getProfile = async (req, res, next) => {
    const id = req.params.id;
    const user = await userModel.findById(id).select("firstName lastName email age phone");
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    return successHandler({ res, data: { user }, status: 200, msg: "User profile retrieved successfully" })
}


router.get('/shareProfile', auth(), shareProfile);
router.get('/:id', validation(getUserByIdSchema), getProfile);


----------

## update email ## 

export const updateEmail = async (req, res, next) => {
    const user = req.user;
    const { newEmail } = req.body;

    if (user.email === newEmail) {
        return next(new Error("New email must be different from the current email", { cause: 400 }));
    }

    const isExist = await findByEmail({ model: userModel, email: newEmail });

    if (isExist) {
        return new NotValidEmailExeption()
    }

    const oldEmailOtp = createOtp()
    const oldEmailHtml = template(oldEmailOtp, user.firstName, "Confirm your old email");
    sendEmail({ to: user.email, subject: "Confirm your old email", html: oldEmailHtml })
    user.oldEmailOtp = { otp: hashSync(oldEmailOtp), expiredAt: Date.now() + 5 * 60 * 60 * 1024 };

    const newEmailOtp = createOtp()
    const newEmailHtml = template(newEmailOtp, user.firstName, "Confirm your new email");
    sendEmail({ to: newEmail, subject: "Confirm your new email", html: newEmailHtml })
    user.newEmailOtp = { otp: hashSync(newEmailOtp), expiredAt: Date.now() + 5 * 60 * 60 * 1024 };

    user.pendingEmail = newEmail;
    await user.save();
    return successHandler({ res, status: 200, msg: "Done" });
}

export const confirmUpdateEmail = async (req, res, next) => {
    const user = req.user;
    const { oldEmailOtp, newEmailOtp } = req.body;

    if (user.oldEmailOtp.expiredAt < Date.now() || user.newEmailOtp.expiredAt < Date.now()) {
        return next(new InvalidOTPExeption());
    }
    
    if (!user.oldEmailOtp.otp || !user.newEmailOtp.otp) {
        return next(new Error("No OTP found.", { cause: 409 }));
    }
    
    // التحقق من OTP القديم
    const isOldOtpValid = compareSync(oldEmailOtp, user.oldEmailOtp.otp);
    // التحقق من OTP الجديد
    const isNewOtpValid = compareSync(newEmailOtp, user.newEmailOtp.otp);
    
    console.log('Old OTP valid:', isOldOtpValid);
    console.log('New OTP valid:', isNewOtpValid);
    
    if (!isOldOtpValid || !isNewOtpValid) {
        return next(new InvalidOTPExeption());
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.oldEmailOtp = undefined;
    user.newEmailOtp = undefined;
    await user.save();

    return successHandler({ res, status: 200, msg: "Email updated successfully" });
    
}

---- 
const otpSchema = new Schema({
    otp: String,
    expiredAt: Date
}, 
{ _id: false })

    emailOtp: otpSchema,
    newEmailOtp: otpSchema,
    oldEmailOtp: otpSchema,
    passwordOtp: otpSchema,
    pendingEmail: String,


export const createOtp = ()=>{
     const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    return otp;
}

-----------------

## soft and hard delete ##


export const softDeleteUser = async (req, res, next) => {
    const {id} = req.params;
    const user = await userModel.findOne({  // لازم اقولو فايند وان عشان اقدر اععمل كونديشن ان لازم ميكنش ممسوح عشان اعرف اسيرش عليه
        isDeleted: false,
        _id: id
    });
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    if (user.role === "admin") {
        return res.status(400).json({ errMsg: "Cannot delete an admin user", status: 400 });
    }
    user.isDeleted = true;
    user.DeletedBy = req.user._id;
    await user.save();
    return successHandler({ res, status: 200, msg: "User soft deleted successfully" })
}


export const restoreUser = async (req, res, next) => {
    const id = req.params.id;
    const user = await userModel.findById(id);
    if (!user) {
        return res.status(404).json({ errMsg: "User not found", status: 404 });
    }
    if(!user.isDeleted){
        return res.status(400).json({ errMsg: "User is not deleted", status: 400 });
    }

    if(user.DeletedBy.toString() !== req.user._id.toString()){
        return res.status(403).json({ errMsg: "You cannot restore a user you didn't delete", status: 403 });
    }

    user.DeletedBy = undefined
    user.isDeleted = false;
    await user.save();
    return successHandler({ res, status: 200, msg: "User restored successfully" })
}

export const DeleteUser = async (req, res, next) => {
    const user = req.user;
    await user.deleteOne()
    return successHandler({ res, status: 200, msg: "User deleted successfully" })
}

router.get('/shareProfile', auth(), shareProfile);
router.patch('/softDelete/:id', auth(), allowTo(Role.admin), softDeleteUser);
router.patch('/restoreUser/:id', auth(), allowTo(Role.admin), restoreUser);
router.delete('/hardDelete/:id', auth(), DeleteUser);
router.get('/:id', validation(getUserByIdSchema), getProfile);
 

export const allowTo = (...roles)=>{
     return async (req, res, next) => {
        try {
            const user = req.user;
            if(!roles.includes(user.role)){
                return res.status(403).json({ errMsg: "Forbidden, you don't have permission to access this resource", status: 403 });
            }
            next()
        } catch (error) {
            return next(error)
        }
    }
}


-------------------------------------------

## upload image ## 

عشان اعمل upload image بستخدم مكتبه اسمها 
npm i multer 

بعد منزلها هعمل فايل عشان يهندل الحجات الى فيها 


---------- 

ال file filter بعملو عشان لو اليوزر بعت حاجه غير صوره يطلعلو ايرور وبعملو فى الميلر فى الفانكشم بتاعه الابلود 

const allowedMimeTypes = {

    image:['image/jpeg', 'image/png','image/jpg', 'image/gif', 'image/webp'],
    video:['video/mp4'],
}

export const uploadFile = (folderName = 'general' , type = allowedMimeTypes.image)=>{

    const storage = diskStorage({
        destination: async (req , file , cb) =>{
            if (!req.user) {
                return cb(new Error("User not authenticated"), null);
            }
            
            const folder = `uploads/${folderName}/${req.user.firstName}`;
            
            try {
                await fs.access(folder);
                cb(null, folder);
            } catch (error) {
                try {
                    await fs.mkdir(folder, { recursive: true });
                    cb(null, folder);
                } catch (mkdirError) {
                    cb(mkdirError, null);
                }
            }
        },
        filename: (req , file , cb) =>{
            cb(null , `${nanoid(10)}-${file.originalname}`);
        }
    })

    const fileFilter = (req , file , cb) =>{
        if(!type.includes(file.mimetype)){
            return cb(new Error('Invalid file type. Only image files are allowed.'), false);
        } 
        return cb(null , true);
    }

    return multer({storage , fileFilter});
}

