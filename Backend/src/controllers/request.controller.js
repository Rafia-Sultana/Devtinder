
const mongoose = require("mongoose");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");

const sendConnectionRequest = async (req, res) => {

    try {
      
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            return res.status(400).json({ message: "Invalid user ID format" })
        }

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status })
        }

        const toUser = await User.findById(toUserId);
       
        if (!toUser) {
            return res.status(404).json({ message: "User Not Found" })
        }

        const connectionRequest = ConnectionRequest({
            fromUserId,
            toUserId, status

        });

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).send({ message: "Connection Request Already Exists!" })
        }

        const data = await connectionRequest.save();
        res.json({
           // message: req.user.firstName + " is " + status + " in " +  toUser.firstName + "!!",
            message: `${req.user.firstName} is ${status} in ${toUser.firstName} !!`,
             data
        })


    } catch (err) {
        res.status(400).send("Error  " + err.message);
    }
}

const responseStatus = async(req,res) =>{
try {
    const loggedInUser = req.user;
    const {status, requestId} = req.params;

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid user ID format" })
        }


    const allowedStatus = ["accepted", "rejected"];
    if(!allowedStatus.includes(status)){
        return res.status(400).json({message:"Status is not allowed!!"});
    }

    const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status:"interested",
    })

    if(!connectionRequest){
      return  res.status(404).json({message: "Connection request not found."});
    }

    connectionRequest.status = status;

    const data = await connectionRequest.save();
    res.json({message: `Connection Request is ${status} !!`, data})
    
} catch (error) {
    res.status(400).send("Error: " + error.message);
}
}

module.exports = {sendConnectionRequest, responseStatus};