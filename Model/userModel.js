var mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://user1:user1kapassword@cluster0.t8zuw.mongodb.net/?retryWrites=true&w=majority')
mongoose.connect('mongodb+srv://user1:user1kapassword@cluster0.t8zuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

// mongoose.connect('mongodb://127.0.0.1:27017/blogApp')

const userSchema= new mongoose.Schema({
    username: String,
    name: String,
    password: String,
    email: String,
    isAdmin:{
        type:Boolean,
        default:false
    },
    date :{
        type:Date,
        default:Date.now
    }
});

const userModel=mongoose.model('user',userSchema);
module.exports=userModel;