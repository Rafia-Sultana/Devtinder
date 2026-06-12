const { forgetPassword, resetPassword } = require("../services/password.service");
const { ApiResponse, ApiError } = require("../utils/apiResponse");


const handleRequest = async(res, serviceCall) =>{
    try {
        const result = await serviceCall();
        return res.status(200).json(new ApiResponse(200, result.message, result.data));

    } catch (err) {
        if(err instanceof ApiError){
            return res.status(err.statusCode).json({
                success: false,
                message: err.message
            })
        }

        console.error("Password controller error", err.message);
        return res.status(500).json({

        })
    }
}

const forgotPasswordController = (req,res) =>{
    const {emailId} = req.body;

    if(!emailId){
        return res.status(400).json({success:false, message:"Email is required."});

    }

    handleRequest(res, ()=>forgetPassword(emailId));
}

const resetPasswordController = (req,res) =>{
    const {token} = req.params;
   
    const {newPassword} = req.body;


    if(!newPassword){
    return res.status(400).json({ success: false, message: "New password is required." });
    }

    handleRequest(res, () => resetPassword(token, newPassword));
}

const changePasswordController = (req,res) =>{
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword){
        return res.status(400).json({
            success:false,
            message:"Current password and new password are required."
        })
    }

 handleRequest(res, () => changePassword(req.user._id, currentPassword, newPassword));
}

const validateTokenController = (req, res) => {
  const { token } = req.params;
  handleRequest(res, () => validateResetToken(token));
};

module.exports = {
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  validateTokenController,
};