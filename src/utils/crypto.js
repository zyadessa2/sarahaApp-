import CryptoJS from "crypto-js";


export const encrypt = (data ) => {
    return CryptoJS.AES.encrypt(data , process.env.CRYPTO_JS).toString()
}

export const decrypt = (data ) => {
    const bytes = CryptoJS.AES.decrypt(data , process.env.CRYPTO_JS);
    return bytes.toString(CryptoJS.enc.Utf8);
}