const mongoose = require("mongoose");

const connectDB = async ()=>{
    await mongoose.connect(
                 "mongodb+srv://mongo-user:mongo-user@mongo-node.iykiejt.mongodb.net/devTinder"
    )
};

module.exports =  connectDB;
