const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const userModel = require('./models/userModel');
const path  = require('path')

const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const postModel = require("./models/postModel");

app.set('view engine' , 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));

const upload = require('./multerconfig');
const postImg = require('./postmulterconfig');


app.get("/", isloggedIn, async (req, res) => {
    try {
        let logeduser = await userModel.findOne({_id : req.user.userid});
        let allposts = await postModel.find().populate('user');
        res.render("home", { allposts , logeduser});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


app.get("/register" , (req , res)=>{
    res.render("register");
});

app.post("/register" ,async (req,res)=>{
    let {username,name,email,password,age,post} = req.body;
    let user = await userModel.findOne({email});
    if(user) return res.status(500).send("User already register");
    
    bcrypt.genSalt(10,(err,salt) =>{
           bcrypt.hash(password,salt, async (err,hash)=>{
              let user =  await userModel.create({
                  username,
                  name,
                  email,
                  age,
                  password:hash,
                  post
})
let token =  jwt.sign({email : user.email , userid : user._id}, "shhhh")
res.cookie('token' , token);
       res.redirect("/");
           })  
    })

}) ;


app.get("/login" , (req , res)=>{
    res.render("login");
})

app.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if(user == null) {
      res.redirect("/login")
      
    } else {
        bcrypt.compare(req.body.password, user.password, function(err, result) {
            if (result) {
                const token = jwt.sign({ email: user.email, userid: user._id }, "shhhh");
                res.cookie("token", token);
                res.redirect('/profile')
            } else {
                return res.status(401).send("Invalid credentials");
            }
        });
    } 
});

app.get("/logout" , (req , res)=>{
    res.cookie('token' , "");
    res.redirect("/login");
})




app.get("/profile" ,isloggedIn ,  async (req , res)=>{
   let loguserData = await userModel.findOne({email : req.user.email});
   let posts = await postModel.find({user : loguserData._id});
     res.render("profile" , {loguserData , posts})
     console.log(posts)
})

app.post("/post", isloggedIn ,async (req , res)=>{
     let user = await userModel.findOne({email : req.user.email});
     let post = await postModel.create({
        user : user._id,
        content : req.body.content,
        postImg : req.body.postImg
     })

     user.post.push(post._id);
      await user.save();
      res.redirect('/profile')
      
})

app.get("/like/:id" , isloggedIn ,async (req ,res)=>{
    
let post = await   postModel.findOne({_id : req.params.id}).populate('user');
        if(post.like.indexOf(req.user.userid) == -1) {
             post.like.push(req.user.userid)
        } else {
            post.like.splice(post.like.indexOf(req.user.userid) , 1)
        }
      await post.save();
      res.redirect('/');


})

app.get("/edit/:id" , async (req , res)=>{
    let post = await postModel.findOne({_id : req.params.id});
    let user = await userModel.findOne({_id : post.user._id});
    res.render("edit" , {post , user});
})

app.post("/edit/:id" ,async (req , res)=>{
  let updated = await  postModel.findOneAndUpdate({_id : req.params.id}, {content : req.body.content})
  res.redirect("/")
})

function isloggedIn(req,res,next) {
   
    try {
        if(req.cookies.token === "") return res.redirect("/login");
        else {
       let data = jwt.verify(req.cookies.token,"shhhh") 
        req.user = data;
        }
        next();  
    } catch (error) {
        res.redirect("/login");
    }
} 

app.get("/profileupload" , (req , res)=>{
     res.render("profileUpload");
})

app.post("/upload" , upload.single('image') , isloggedIn ,async (req ,res)=>{
    let user =  await userModel.findOne({email : req.user.email})
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
 })



app.listen(3000);