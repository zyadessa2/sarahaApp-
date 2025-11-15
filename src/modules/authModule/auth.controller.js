import { Router } from "express";
import * as authServices from "./auth.services.js";
import { auth } from "../../middleware/auth.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
const router = Router();


router.post("/signup", validation(signupSchema), authServices.signup)
router.post("/confirmEmail", authServices.confirmEmail)
router.post("/resendEmailOtp", authServices.resendOTP)

router.post("/login", validation(loginSchema) , authServices.login)

router.get("/", auth() ,authServices.getUserProfile)

router.post("/refreshToken", authServices.refreshToken)

router.post("/forgetPassword", authServices.forgetPassword)
router.post("/changePassword", authServices.changePassword)

// router.post('/socialLogin', authServices.socialLogin)

router.patch('/updateEmail', auth(), authServices.updateEmail);
router.patch('/confirmUpdateEmail', auth(), authServices.confirmUpdateEmail);

export default router;