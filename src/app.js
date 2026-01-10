// import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"

// const app = express() 

// app.use(cors({
//     // origin:process.env.CORS_ORIGIN,
//     origin:'*',
//     credentials:true
// }))

// app.use(express.json({limit:"16kb"}))

// app.use(express.urlencoded({extended:true,limit:"16kb"}))

// app.use(express.static("public"))
// app.use(cookieParser())

// //routes import
// // import userRouter from './routes/user.routes.js'
// import userRouter from './routes/user.routes.js'
// //routes declaration
// app.use("/api/v1/users", userRouter)

// // http

// export{ app }

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors()); // ✅ FIXED

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// test route
app.get("/test", (req, res) => {
  res.json({ message: "Server working" });
});

// routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

export { app };
