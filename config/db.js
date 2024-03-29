const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async() => {
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true,
            userCreateIndex: true
        });
        console.log('MongoDB connected...');
    } catch(err){
        console.error(err.message);
        console.log('there is an error');
        process.exit(1);
    }
}

module.exports = connectDB;