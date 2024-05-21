const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/community'); 
const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    profilepic : {
        type : String,
        default : "default.jpeg"
    },
    post: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }]
});

module.exports = mongoose.model('user', userSchema);
