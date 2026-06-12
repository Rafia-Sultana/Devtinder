const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

//Get all the pending connection request for the loggedIn user
const pendingConnectionRequest = async (req, res) => {

    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        }).populate("fromUserId", USER_SAFE_DATA)

        res.json({
            message: "Data fetched successfully!",
            data: connectionRequests

        })
    } catch (error) {
        res.status(400).send("ERROR :" + error.message);
    }
}

const acceptedConnectionRequest = async (req, res) => {
    try {

        const loggedInUser = req.user;
        const existingAcceptedRequest = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ],
            status: "accepted"
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const Connections = existingAcceptedRequest.map((row) => {

            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId
            }
            return row.fromUserId;
        })

        if (!existingAcceptedRequest) {
            return res.status(404).json({ message: "Connection request not found." });
        }

        res.json({ data: Connections })

    } catch (error) {
        res.status(400).send("ERROR: ", error.message);
    }
}

const feed = async (req, res) => {
    try {

        //pagination
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = parseInt(req.query.limit) || 10;

        // ✅ Enforce minimums
        page = Math.max(page, 1);
        limit = Math.max(limit, 1);

        // ✅ Enforce maximums
        limit = Math.min(limit, 50);
        page = Math.min(page, 1000);

        const skip = (page - 1) * limit;
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }
            ]
        })
            .select("fromUserId  toUserId")

        const hideUserFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUserFromFeed.add(request.fromUserId.toString());
            hideUserFromFeed.add(request.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                {
                    _id: {
                        $nin: Array.from(hideUserFromFeed),
                        $ne: loggedInUser._id
                    }
                }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send({data:users});

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { pendingConnectionRequest, acceptedConnectionRequest, feed }
