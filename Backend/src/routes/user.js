const express = require("express");
const userRouter = express.Router();
const authMiddleware = require("../middleware/auth");
const { pendingConnectionRequest, acceptedConnectionRequest,feed } = require("../controllers/user.controller");

userRouter.get("/user/requests/received", authMiddleware, pendingConnectionRequest);

userRouter.get("/user/connections", authMiddleware, acceptedConnectionRequest);

userRouter.get("/feed", authMiddleware, feed);

module.exports = userRouter;