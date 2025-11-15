export class NotFoundUrlExeption extends Error {
    constructor(){
        super("not found URL" , { cause: 404 });
    }
}

export class NotValidEmailExeption extends Error {
    constructor(){
        super("not valid email" , { cause: 400 });
    }
}

export class InvalidCradentialsExeption extends Error {
    constructor(msg){
        super(msg || "not valid email or password" , { cause: 401 });
    }   
}

export class InvalidTokenExeption extends Error {
    constructor(){
        super("not valid token" , { cause: 409 });
    }   
}

export class InvalidOTPExeption extends Error {
    constructor(){
        super("not valid OTP" , { cause: 409 });
    }
}

export class NotConfirmedEmailExeption extends Error {
    constructor(){
        super("not confirmed email" , { cause: 400 });
    }
}