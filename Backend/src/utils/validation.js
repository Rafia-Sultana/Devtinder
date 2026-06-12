const validator = require("validator");

const validateEditProfileData = (req) =>{
    const allowedEditFields = [
        "firstName",
        "lastName",
        "photoUrl",
        "gender",
        "age",
       "skills"
    ];
    const isEditAllowed = Object.keys(req.body).every((field)=>allowedEditFields.includes(field))
  return isEditAllowed;

}
module.exports = validateEditProfileData;