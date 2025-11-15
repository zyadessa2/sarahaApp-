import authRouter from "./modules/authModule/auth.controller.js";
import userRouter from "./modules/userModule/user.controller.js";
import messageRouter from "./modules/msgModule/message.controller.js";
import connectDB from "./DB/connection.js";
import { NotFoundUrlExeption } from "./utils/exeptions.js";
import { sendEmail } from "./utils/sendEmail/sendEmail.js";
import cors from "cors";
import { auth } from "./middleware/auth.middleware.js";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";



// const bootstrap = async (app, express) => {
//     const port = process.env.PORT;
//     app.use(cors())
//     app.use(express.json());
//     app.use(morgan('dev'));
//     app.use(helmet());

//     // app.use((req, res, next) => {
//     //     res.header("Access-Control-Allow-Origin", "*");
//     //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//     //     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
//     //     res.header("Access-Control-Allow-Credentials", "true");
//     //     next();
//     // })
//     app.use(cors())


//     app.use(rateLimit({
//         windowMs: 2 * 60 * 1000, // 2 minutes
//         limit: 10, // limit each IP to 10 requests per windowMs
//         legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//     }));
//     await connectDB();


//     app.use('/users', userRouter)
//     app.use('/auth', authRouter)
//     app.use('/messages', messageRouter)

//     app.use('/uploads', express.static('uploads'));

//     app.all('{/*s}', (req, res, next) => {
//         return next(new NotFoundUrlExeption());
//     });

//     app.use((err, req, res, next) => {
//         console.log("Error occurred: ", err.stack);
//         res.status(err.cause || 500).json({
//             errMsg: err.message || 'internal server error',
//             status: err.cause || 500

//         });

//     });

//     app.listen(port, () => {
//         console.log(`Server is running on port ${port}`);
//     });

// };


const bootstrap = async (app, express) => {
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));
    app.use(helmet());

    app.use(rateLimit({
        windowMs: 2 * 60 * 1000,
        limit: 10,
        legacyHeaders: false,
    }));

    await connectDB();

    app.use('/users', userRouter);
    app.use('/auth', authRouter);
    app.use('/messages', messageRouter);

    app.use('/uploads', express.static('uploads'));

    app.all('*', (req, res, next) => {
        return next(new NotFoundUrlExeption());
    });

    app.use((err, req, res, next) => {
        console.log("Error occurred: ", err.stack);
        res.status(err.cause || 500).json({
            errMsg: err.message || 'internal server error',
            status: err.cause || 500
        });
    });

    return app; // مهم
};

export default bootstrap;
