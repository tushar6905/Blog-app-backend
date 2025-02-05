// var express = require("express");
// var router = express.Router();
// var userModel = require("../Model/userModel");
// var blogModel = require("../Model/blogModal/blogModel");
// var bcrypt = require("bcrypt");
// const multer  = require('multer')
// const path=require('path')
// var jwt=require('jsonwebtoken')

// const secret='secret';

// /* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });
// router.post("/signup", async (req, res) => {
//   let { username, name, password, email } = req.body;
//   let emailCondition = await userModel.findOne({ email: email });
//   if (emailCondition) {
//     return res.json({
//       success: false,
//       msg: "Email already exists",
//     });
//   } else {
//     bcrypt.genSalt(12, function (err, salt) {
//       if (err) {
//         return res
//           .status(500)
//           .json({ success: false, msg: "Internal server error" });
//       }
//       bcrypt.hash(password, salt, async function (err, hash) {
//         if (err) {
//           return res
//             .status(500)
//             .json({ success: false, msg: "Error hashing password" });
//         }
//         let user = await userModel.create({
//           username: username,
//           name: name,
//           password: hash,
//           email: email,
//         });
//         return res.json({
//           success: true,
//           msg: "User created",
//         });
//       });
//     });
//   }
// });

// router.post("/login", async (req, res) => {
//   let { email, password } = req.body;
//   let user = await userModel.findOne({ email: email });
//   if (!user) {
//     return res.json({
//       success: false,
//       msg: "User not found",
//     });
//   } else {
//     bcrypt.compare(password, user.password, async function (err, result) {
//       if (result) {
//         let token=jwt.sign({userId: user._id},secret)
//         return res.json({
//           success: true,
//           msg: "Login successful",
//           token:token
//         });
//       }else{
//         return res.json({
//           success: false,
//           msg: "Incorrect password",
//         });
//       }
//     });
//   }
// });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // cb(null, '/uploads')
//     cb(null, path.join(__dirname, '../uploads'));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     const extName= path.extname(file.originalname)
//     cb(null, file.fieldname + '-' + uniqueSuffix+extName)
//   }
// })
// const upload = multer({ storage: storage });
// router.post('/uploadBlog',upload.single('image'),async (req,res)=>{
//   try { 
//     // let {token, title, desc, content} = req.body;
//     // Decode the token to get the user ID
//        // Get token from headers
//        let token = req.headers.authorization;
//        if (!token) {
//          return res.status(401).json({ success: false, msg: "Token missing" });
//        }
//        console.log(token,'this is token')
   
//        // Remove 'Bearer ' prefix if present
//        token = token.replace("Bearer ", "");
//     let decoded = jwt.verify(token, secret);
//     let user = await userModel.findOne({ _id: decoded.userId });
    
//     if (!user) {
//       return res.json({
//         success: false,
//         msg: "User not found"
//       });
//     }
    
//     // Retrieve the file name from the uploaded file
//     const imageName = req.file ? req.file.filename : null;

//     // Create a new blog entry
//     let blog = await blogModel.create({
//       title: title,
//       content: content,
//       image: imageName, // Use the image name here
//       desc: desc,
//       user: user._id
//     });

//     // Respond with success
//     return res.json({
//       success: true,
//       msg: "Blog created successfully",
//       blog: blog
//     });
//   } catch (error) {
//     console.error(error);
//     return res.json({
//       success: false,
//       msg: "An error occurred",
//     });
//   }
// });



// module.exports = router;

var express = require("express");
var router = express.Router();
var userModel = require("../Model/userModel");
var blogModel = require("../Model/blogModal/blogModel");
var bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
var jwt = require("jsonwebtoken");
require("dotenv").config(); // Load environment variables

const secret = process.env.JWT_SECRET || "secret"; // Use env variable for security

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    let { username, name, password, email } = req.body;
    let emailCondition = await userModel.findOne({ email: email });
    if (emailCondition) {
      return res.status(400).json({ success: false, msg: "Email already exists" });
    }

    bcrypt.genSalt(12, function (err, salt) {
      if (err) return res.status(500).json({ success: false, msg: "Internal server error" });

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.status(500).json({ success: false, msg: "Error hashing password" });

        let user = await userModel.create({ username, name, password: hash, email });
        return res.status(201).json({ success: true, msg: "User created" });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    bcrypt.compare(password, user.password, async function (err, result) {
      if (result) {
        let token = jwt.sign({ userId: user._id }, secret, { expiresIn: "1h" });
        return res.json({ success: true, msg: "Login successful", token });
      } else {
        return res.status(401).json({ success: false, msg: "Incorrect password" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extName = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extName);
  },
});

const upload = multer({ storage: storage });

// Upload Blog Route
router.post("/uploadBlog", upload.single("image"), async (req, res) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, msg: "Token missing" });
    }

    token = token.replace("Bearer ", "");
    console.log("Received Token:", token);

    // Validate JWT format
    if (token.split(".").length !== 3) {
      return res.status(400).json({ success: false, msg: "Invalid JWT format" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Extract blog details from request
    let { title, desc, content } = req.body;
    if (!title || !desc || !content) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    // Get uploaded file name
    const imageName = req.file ? req.file.filename : null;

    // Create blog entry
    let blog = await blogModel.create({
      title,
      content,
      image: imageName,
      desc,
      user: user._id,
    });

    return res.status(201).json({ success: true, msg: "Blog created successfully", blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "An error occurred" });
  }
});

module.exports = router;