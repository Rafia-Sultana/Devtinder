const express = require("express");
const requestRouter = express.Router();


const authMiddleware = require("../middleware/auth");
const {sendConnectionRequest, responseStatus} = require("../controllers/request.controller");

requestRouter.post("/request/send/:status/:toUserId", authMiddleware, sendConnectionRequest);
requestRouter.post("/request/review/:status/:requestId", authMiddleware, responseStatus);

module.exports = requestRouter; 