import mongoose from "mongoose";

const connectDB = async ()=>{
    await mongoose.connect(process.env.MONGOOSE_URL).then(()=>{
        console.log("DB connected");
    }).catch((err)=>{
        console.log("DB connection error: ", err);
    });

};


export default connectDB;