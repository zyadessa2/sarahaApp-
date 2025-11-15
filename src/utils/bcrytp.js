import bcrypt from "bcryptjs";

export const hash = (password)=>{
    return bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS))
}

export const compare = (text, hashedPassword) => {
    return bcrypt.compareSync(text, hashedPassword)
}