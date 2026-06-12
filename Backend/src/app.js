const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const authMiddleware = require("./middleware/auth");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser())


const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const passwordRouter = require("./routes/password");
const requestRouter = require("./routes/request"); 
const userRouter = require("./routes/user");
          

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/api/v1", passwordRouter);
app.use("/", requestRouter);   
app.use("/", userRouter);  

connectDB()
.then(()=>{
    console.log("db connected");
    app.listen(7777, ()=>{
    console.log("server is successfully listening!!");
})
})
.catch((err)=>{
    console.error("db not connected", err);
});


