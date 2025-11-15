import { InvalidCradentialsExeption, InvalidOTPExeption, NotConfirmedEmailExeption, NotValidEmailExeption } from "../../utils/exeptions.js";
import { successHandler } from "../../utils/successHandler.js";
import { create, findByEmail, findOne } from "../../DB/DBServices.js";
import jwt from "jsonwebtoken";
import { decodeToken, tokenType } from "../../middleware/auth.middleware.js";
import { customAlphabet } from "nanoid";
import { template } from "../../utils/sendEmail/generateHTML.js";
import { createOtp, sendEmail } from "../../utils/sendEmail/sendEmail.js";
import { compareSync,compare, hashSync } from "bcryptjs";
import userModel from "../../DB/models/user.model.js";

// import {OAuth2Client}from 'google-auth-library'
// const client = new OAuth2Client();


export const signup = async (req, res, next) => {
    const { firstName, lastName, email, password, age, gender, role, phone } = req.body;

    const isExist = await findOne({ model: userModel, filter: { email } });
    if (isExist) return next(new NotValidEmailExeption());

    const otp = createOtp()
    const subject = "Verify your email";
    const html = template(otp, firstName, subject);

    const user = await create({ model: userModel, data: { firstName, lastName, email, password, age, gender, role, phone, emailOtp: { otp: hashSync(otp), expiredAt: Date.now() + 10 * 60 * 1000 } } });

    await sendEmail({ to: user.email, subject, html });

    return successHandler({ res, data: user, status: 201, msg: "user created" });
}

export const resendOTP = async (req, res, next) => {
    const { email } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());
    if (user.confirmed) return next(new Error("Email already confirmed", { cause: 400 }));
    if (user.emailOtp.expiredAt > Date.now()) return next(new Error("OTP not expired yet", { cause: 400 }));

    const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    const subject = "Verify your email (resend otp)";
    const html = template(otp, user.firstName, subject);
    await sendEmail({ to: user.email, subject, html });
    await user.updateOne({ emailOtp: { otp: hashSync(otp), expiredAt: Date.now() + 10 * 60 * 1000 } });

    return successHandler({ res, data: user, status: 200, msg: "OTP resent successfully" });

}

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await findOne({ model: userModel, filter: { email } });
    if (!user?.confirmed) {
        throw new NotConfirmedEmailExeption()
    }
    if (!user || !user.checkPassword(password)) return next(new InvalidCradentialsExeption());

    console.log('ACCESS_SIGNATURE:', process.env.ACCESS_SIGNATURE);
    console.log('REFRESH_SIGNATURE:', process.env.REFRESH_SIGNATURE);

    const accsessToken = jwt.sign({
        id: user._id,
    }, process.env.ACCESS_SIGNATURE, {
        expiresIn: '60 Min'
    })
    
    console.log('Access token generated:', accsessToken);
    
    const refreshToken = jwt.sign({
        id: user._id,
    }, process.env.REFRESH_SIGNATURE, {
        expiresIn: '7 D'
    })
    
    console.log('Refresh token generated:', refreshToken);

    return successHandler({
        res, data: {
            accsessToken, refreshToken
        }, status: 200, msg: "user logged in"
    });
}


export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const user = await decodeToken({ token: refreshToken, type: tokenType.refresh })

        const newAccessToken = jwt.sign({
            id: user._id
        }, process.env.ACCESS_SIGNATURE, {
            expiresIn: '15 Min'
        });

        return successHandler({
            res, data: {
                accessToken: newAccessToken
            }, status: 200, msg: "access token refreshed"
        });
    } catch (error) {
        return next(error);
    }
}

export const getUserProfile = async (req, res, next) => {
    try {
        const user = req.user
        // التحقق من وجود phone قبل محاولة decrypt

        successHandler({ res, data: user, status: 200, msg: "User profile retrieved successfully" })
    } catch (error) {
        console.log('Error in getUserProfile:', error);
        return next(error);
    }
}

export const confirmEmail = async (req, res, next) => {
    const { otp, email } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());

    if (user.emailOtp.expiredAt < Date.now()) return next(new InvalidOTPExeption());
    if (!user.emailOtp.otp) throw new Error("No OTP found.", { cause: 409 });
    if (!compare(otp, user.emailOtp.otp)) return next(new InvalidOTPExeption());
    await user.updateOne({ confirmed: true, $unset: { emailOtp: "" } });
    return successHandler({ res, data: user, status: 200, msg: "Email confirmed successfully" });
}

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());
    if (!user.confirmed) return next(new Error("Email not confirmed yet", { cause: 400 }));
    if (user.passwordOtp.expiredAt > Date.now()) return next(new Error("Previous OTP not expired yet", { cause: 400 }));

    const custom = customAlphabet('1234567890');
    const otp = custom(6); // مثال على إنشاء OTP مكون من 6 أرقام
    const subject = "Reset your password (forget password)";
    const html = template(otp, user.firstName, subject);
    await sendEmail({ to: user.email, subject, html });
    await user.updateOne({ passwordOtp: { otp: hashSync(otp), expiredAt: Date.now() + 10 * 60 * 1000 } });

    return successHandler({ res, data: user, status: 200, msg: "Forget password OTP sent to your email" });

}

export const changePassword = async (req, res, next) => {
    const { otp, email, newPassword } = req.body;
    const user = await findByEmail({ model: userModel, email });
    if (!user) return next(new NotValidEmailExeption());
    if (!user.passwordOtp.otp) throw new Error("No OTP found.", { cause: 409 });
    if (user.passwordOtp.expiredAt < Date.now()) return next(new InvalidOTPExeption());
    if (!compare(otp, user.passwordOtp.otp)) return next(new InvalidOTPExeption());

    await user.updateOne({ password: newPassword, $unset: { passwordOtp: "" }, changedCredentialsAt: Date.now() });

    return successHandler({ res, data: user, status: 200, msg: "Password changed successfully" });

}

// export const socialLogin = async (req, res, next) => {
//     const idToken = req.body.idToken;
//     const ticket = await client.verifyIdToken({ 
//         idToken,
//         audience: process.env.GOOGLE_CLIENT_ID
//      });
//      const payload = ticket.getPayload();

//     console.log(payload)

// };


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