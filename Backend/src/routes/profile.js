const express = require("express");
const profileRouter = express.Router();

const authMiddleware = require("../middleware/auth");
const validateEditProfileData = require("../utils/validation")

profileRouter.get("/profile/view", authMiddleware, async(req,res)=>{
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Error: "+ err.message)
  }
});

profileRouter.delete("/user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.send("User deleted successfully");

  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

profileRouter.patch("/profile/edit", authMiddleware, async(req,res)=>{
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }
       const loggedInUser = req.user;

       Object.keys(req.body).forEach((key)=>(loggedInUser[key] = req.body[key]))
   
    loggedInUser.save();
    res.send(`${loggedInUser.firstName}, your profile updated successfully!`)
    
    } catch (error) {
        res.status(400).send("ERROR  :  " + error.message)
    }
})
module.exports = profileRouter;