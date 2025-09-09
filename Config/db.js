const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        const MONGO_URL = "mongodb+srv://zanordbath_db_user:YyDdHOpYHGD2p2rE@zanordbathware.jxjqjhs.mongodb.net/?retryWrites=true&w=majority&appName=ZanordBathware";

        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;
