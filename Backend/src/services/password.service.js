const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { ApiError } = require("../utils/apiResponse");


const forgetPassword = async (emailId) =>{
    const user = await User.findOne({emailId});
    if(!user){
        return {message: "If this email exists, a reset link has been sent"};
    }

    const resetToken = crypto.randomBytes(32).toString("hex");


    console.log("reset token", resetToken);
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 15*60*1000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


    await sendEmail({
    to: user.emailId,
    subject: "Password Reset Request — DevTinder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the button below:</p>
        <a href="${resetURL}"
           style="display:inline-block; padding:12px 24px;
                  background:#e74c3c; color:#fff;
                  border-radius:6px; text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in <strong>15 minutes.</strong></p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `,
  });

return { message: "If this email exists, a reset link has been sent." };
}

const resetPassword = async(resetToken, newPassword) =>{
    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: {$gt: Date.now()},
    })

      if (!user) {
    throw new ApiError(400, "Reset token is invalid or has expired.");
  }
     
  user.password = await bcrypt.hash(newPassword, 12);

  user.resetPasswordToken  = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  return { message: "Password reset successfully. Please log in." };
}

const changePassword = async (userId, currentPassword, newPassword) =>{
   const user = await User.findById(userId).select("+password");
   
   if(!user){
    throw new ApiError(404, "User not found.");
   }

   const isMatch = await bcrypt.compare(currentPassword, user.password);

   if(!isMatch){
        throw new ApiError(401, "Current password is incorrect.");
   }

     const isSame = await bcrypt.compare(newPassword, user.password);
     if (isSame) {
    throw new ApiError(400, "New password must be different from current password.");
  }

   user.password  = await bcrypt.hash(newPassword, 12);
  user.lastLogin = new Date();
  await user.save();

  // 5. Notify user via email (security alert)
  await sendEmail({
    to: user.emailId,
    subject: "Your Password Was Changed — DevTinder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Password Changed</h2>
        <p>Hi ${user.firstName},</p>
        <p>Your password was changed successfully on
           <strong>${new Date().toLocaleString()}</strong>.
        </p>
        <p>If you did not do this, please reset your password immediately.</p>
      </div>
    `,
  });

  return { message: "Password changed successfully." };

}

const validateResetToken =  async (resetToken) =>{

    const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: {$gt: Date.now()}
    });


    if(!user){
         throw new ApiError(400, "Reset token is invalid or has expired.");
    }

    return { valid: true, email: user.emailId };
}

module.exports = {
    forgetPassword,
    resetPassword,
    changePassword,
    validateResetToken
}