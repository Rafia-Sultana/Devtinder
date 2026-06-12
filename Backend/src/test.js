// connect.js
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://mongo-user:mongo-user@mongo-node.iykiejt.mongodb.net/devTinder")
  .then(() => console.log("Connected!"))
  .catch(err => console.log("Error:", err.message));