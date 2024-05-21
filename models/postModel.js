const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/community'); 

const user = require('./userModel');

const postschema = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    date : {
        type : Date,
        default : Date.now,
    },
    content : String,
    like : [{
         type : mongoose.Schema.Types.ObjectId , 
         ref : 'user',
        
    }],
    postImg : {
        type : String,
    },
})
 
module.exports =   mongoose.model("post" , postschema);