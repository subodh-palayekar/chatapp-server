const User = require("../models/userModel")
const Chat = require("../models/chatModel")
const generateToken = require("../config/generateToken")

const registrationController = async (req,res)=>{

    const {name,email,password,username} = req.body;

    if(!name || !email || !password || !username){
        res.status(400).json({message : "please fill all required field"})
    }

    const userNameExist = await User.findOne({username})
    if(userNameExist){ 
        res.status(400).json({message : "userName already exist"})
        return 
    }
    const emailExist = await User.findOne({email})
    if(emailExist){
        res.status(400).json({message : "email already exist"})
        return
    }

    const newUser =  new User({
        name,
        email,
        password,
        username,
    })

    const userRegister = await newUser.save()
    if(userRegister){
        res.status(201).json({
            _id:userRegister._id,
            name:userRegister.name,
            email : userRegister.email,
            username :userRegister.username,
            isAdmin : userRegister.isAdmin, 
            token:generateToken(userRegister._id)
        })
    }else{
        res.status(400).json({message:"user not register"});
    }

}


const loginController = async (req,res)=>{
    const {username,password} = req.body

    const user = await User.findOne({username})

    if(!user){
        res.status(404).json({message:"user Not Exist please register"})
        return
    }


    if( user &&  (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email ,
            username:user.username,
            token :generateToken(user._id),
            isAdmin : user.isAdmin,
            
        })
        console.log(user);
    }else{
        res.status(401).json({message:"login failed"})
    }

}

const fetchAllUser = async (req,res)=>{
    const keyword = req.query.search ? { username : {$regex : req.query.search,$options:"i"}}:{ };
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}}).select("-password");
    res.send(users);

}

const modify = async (req,res)=>{
    const keyword = req.query.search ? { username : {$regex : req.query.search,$options:"i"}}:{ };
    const currentUser = await User.find(keyword).find({_id:req.user._id}).select("friends");
    const currentUserFriendsIds = currentUser.map(user => user.friends);
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}}).select("-password");
    res.status(200).json({users:users,friends:currentUserFriendsIds});
}

module.exports = {registrationController,loginController,fetchAllUser,modify}