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
      return res
        .status(400)
        .json({ success: false, msg: "Email already exists" });
    }

    bcrypt.genSalt(12, function (err, salt) {
      if (err)
        return res
          .status(500)
          .json({ success: false, msg: "Internal server error" });

      bcrypt.hash(password, salt, async function (err, hash) {
        if (err)
          return res
            .status(500)
            .json({ success: false, msg: "Error hashing password" });

        let user = await userModel.create({
          username,
          name,
          password: hash,
          email,
        });
        return res.status(201).json({ success: true, msg: "User created" });
      });
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
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
        return res
          .status(401)
          .json({ success: false, msg: "Incorrect password" });
      }
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Internal server error" });
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
      return res
        .status(400)
        .json({ success: false, msg: "Invalid JWT format" });
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
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
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

    return res
      .status(201)
      .json({ success: true, msg: "Blog created successfully", blog });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "An error occurred" });
  }
});

router.post("/getBlogs", async (req, res) => {
  let { token } = req.body;
  let decoded = jwt.verify(token, secret);
  let user = await userModel.findOne({ _id: decoded.userId });
  if (!user) {
    return res.status(404).json({ success: false, msg: "User not found" });
  }else{
    let blog=await blogModel.find({});
    return res.json({
      success: true,
      msg: "Blogs fetched successfully",
      blogs: blog
    })
  }
});

// router.post('/getBlog',async (req,res)=>{
//   let {token ,blogId}=req.body;
//   let decoded = jwt.verify(token, secret);
//   let user = await userModel.findOne({ _id: decoded.userId });
//   if (!user) {
//     return res.status(404).json({ success: false, msg: "User not found" });
//   }else{
//     let blog=await blogModel.findById({_id : blogId});
//     return res.json({
//        success :true,
//        msg : "Blog fetched successfully",
//       blog : blog
//     }) 
//   }
// })

router.post('/getBlog', async (req, res) => {
  let { token, blogId } = req.body;

  if (!blogId || blogId.length !== 24) { // Check if blogId is valid
    return res.status(400).json({ success: false, msg: "Invalid Blog ID" });
  }

  try {
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    let blog = await blogModel.findById(blogId); // No need to wrap it in an object
    if (!blog) {
      return res.status(404).json({ success: false, msg: "Blog not found" });
    }

    return res.json({
      success: true,
      msg: "Blog fetched successfully",
      blog: blog,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "Internal server error" });
  }
});

module.exports = router;
