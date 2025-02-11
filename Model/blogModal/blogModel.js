var mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://user1:user1kapassword@cluster0.t8zuw.mongodb.net/?retryWrites=true&w=majority')
mongoose.connect('mongodb+srv://user1:user1kapassword@cluster0.t8zuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// mongoose.connect('mongodb://127.0.0.1:27017/blogApp')

const blogSchema= new mongoose.Schema({
    title: String,
    desc: String,
    image: String,
    content: String,
    date: {
      type: Date,
      default: Date.now,
    }
});

const blogModel=mongoose.model('Blog',blogSchema);
module.exports=blogModel;