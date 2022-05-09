const mongoose = require("mongoose")

module.exports = () =>{
    // console.log(process.env.mongoDb);
    return mongoose.connect(process.env.MONGO_DB , () => {
        console.log('DATABASE CONNECTED!!!!');
    });
}