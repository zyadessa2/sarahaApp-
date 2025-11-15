import jwt from "jsonwebtoken"
import { InvalidTokenExeption, NotConfirmedEmailExeption } from "../utils/exeptions.js"
import { findById, findOne } from "../DB/DBServices.js"
import userModel from "../DB/models/user.model.js"


export const tokenType = {
    access: "access",
    refresh: "refresh"
}
Object.freeze(tokenType);

export const decodeToken = async ({ authorization, token, type = tokenType.access }) => {
    let actualToken;

    if (token) {
        actualToken = token;
    } else if (authorization) {
        if (!authorization.startsWith(process.env.BEARER_TOKEN)) {
            throw new InvalidTokenExeption()
        }
        actualToken = authorization.split(" ")[1];
    } else {
        throw new InvalidTokenExeption()
    }

    let signature = process.env.ACCESS_SIGNATURE
    if (type === tokenType.refresh) {
        signature = process.env.REFRESH_SIGNATURE
    }

    const data = jwt.verify(actualToken, signature)
    const user = await findOne({
        model: userModel,
        filter: { _id: data.id , isDeleted: false }
    })
    if (!user) {
        throw new InvalidTokenExeption()
    }
    if(!user?.confirmed){
        throw new NotConfirmedEmailExeption()
    }
    if(user.changedCredentialsAt?.getTime() > data.iat * 1000){
        throw new InvalidTokenExeption()
    }
    return user;
}


export const auth = () => {
    return async (req, res, next) => {
        try {

            const authorization = req.headers.authorization

            const user = await decodeToken({ authorization })
            if (!user) {
                return next(new InvalidTokenExeption())
            }
            req.user = user
            next()
        } catch (error) {
            return next(error)
        }
    }
}

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