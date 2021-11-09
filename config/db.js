const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../.env" });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, err => {
            if (err) throw err;
            console.log('Connected to MongoDB!')
        });
    } catch (error) {
        console.log("MongoDB connection error", error)
        process.exit(1)
    }
}

module.exports = connectDB;