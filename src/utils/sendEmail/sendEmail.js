import nodemailer from 'nodemailer';
import { customAlphabet } from 'nanoid';

export const sendEmail = async ({to , subject , html})=>{
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
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

export const createOtp = ()=>{
     const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    return otp;
}