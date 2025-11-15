// import mongoose from "mongoose";

// const connectDB = async ()=>{
//     await mongoose.connect(process.env.MONGOOSE_URL).then(()=>{
//         console.log("DB connected");
//     }).catch((err)=>{
//         console.log("DB connection error: ", err);
//     });

// };


// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URL, {
      serverSelectionTimeoutMS: 30000, // زود الوقت لـ 30 ثانية
    });
    console.log("DB connected");
  } catch (err) {
    console.log("DB connection error:", err.message);
    throw err; // مهم عشان تشوف الخطأ في Vercel logs
  }
};

export default connectDB;
