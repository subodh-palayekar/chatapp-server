const Chat = require("../models/chatModel");
const User = require("../models/userModel");


const accessChat = async (req,res)=>{
    const {userId} = req.body;

    if(!userId){
        console.log("userid not sent with request");
        return res.status(400);
    }

    var isChat = await Chat.find({
        isGroupChat:false, 
        $and:[ 
            {users :{$elemMatch :{$eq :req.user._id}}},
            {users :{$elemMatch :{$eq :userId}}}, 
        ],
    })
    .populate("users","-password")
    .populate("latestMessage");

    isChat = await User.populate(isChat,{
        path : "latestMessage.sender",
        select : "username email name"
    })

    if(isChat.lenght>0){
        res.send(isChat[0]);
    }else{
        var charData = {
            chatName : "sender",
            isGroupChat : false,
            users : [req.user._id , userId],
        };
        const add1 = await User.findByIdAndUpdate(userId,
            {
                $push:{friends:req.user._id},
            },{
                new :true
            })  
        const add2 = await User.findByIdAndUpdate(req.user._id,
            {
                $push:{friends:userId},
            },{
                new :true
            })  

        console.log("user added");

        try {
            const createdChat = await Chat.create(charData);
            const FullChat = await Chat.findOne({_id:createdChat._id}).populate("users","-password");
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
        }
    }
}

const fetchChats = async (req,res)=>{
    try { 
        await Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt :-1})
        .then(async (results)=>{
            results =await User.populate(results,{
                path:"latestMessage.sender",
                select:"username email name",
            });
            res.status(200).send(results);
        });
    } catch (error) {
        res.status(400).json({message:"Error while Fetching the conversations"});
    }
}


const fetchGroup = async (req,res)=>{
    try {
        const allGroups = await Chat.where("isGroupChat").equals(true);
        res.status(200).send(allGroups);
    } catch (error) {
        res.status(400);
    }
}


const createGroupChat = async (req,res) =>{

    if(!req.body.users || !req.body.name){
        return res.status(400).json({message : "data is insufficient"})
    }
    var users = req.body.users;
    users.push(req.user)

    try{
        const groupChat = await Chat.create({
            chatName : req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin :req.user,
        })

        const fullGroupChat = await Chat.findOne({_id:groupChat._id})
        .populate("users","-password")
        .populate("groupAdmin","-password");

        res.status(200).json(fullGroupChat);
    }catch(e){
        res.status(400);;
    }
}

const groupExit = async (req,res)=>{

    const {chatId , userId, otherUser} = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId,
    {
        $pull:{users:userId},
    },
    {
        new:true,
    }
    )
    .populate("users","-password")
    .populate("groupAdmin","-password");

    try {
        const remove1 =await User.updateOne({_id:userId},
            {
                $pull:{friends:otherUser},
            },
            {
                new:true
            })
        const remove2 = await User.updateOne({_id:otherUser},
            {
                $pull:{friends:userId},
            },
            {
                new:true
            })
    
    
    } catch (error) {
        res.send("error occur in group exist")
    }

    if(!removed){
        res.status(404).json({message:"Chat not found"})
    }else{
        res.json(removed)
    }
}

const deleteGroup=async(req,res)=>{

    const{chatId,otherUser} = req.body;
    
    try {
        const deleted = await Chat.findByIdAndDelete({_id:chatId});
        res.status(200).send(deleted)
    } catch (error) {
        res.send("error while deleting group");
    }

}

const addSelfToGroup=async(req,res)=>{

    const {chatId , userId} = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId,
        {
            $push:{users:userId},
        },
        {
            new:true,
        }
        )
        .populate("users","-password")
        .populate("groupAdmin","-password");
    if(!removed){
        res.status(404).json({message:"Chat not found"})
    }else{
        res.json(removed)
    }

}

const removeFriend = async (req,res)=>{
    const {userId,otherUser}=req.body;   
        const remove1 =await User.updateOne({_id:userId},
            {
                $pull:{friends:otherUser},
            },
            {
                new:true
            })
        const remove2 = await User.updateOne({_id:otherUser},
            {
                $pull:{friends:userId},
            },
            {
                new:true
            })

        res.json({remove1,remove2})  
    
}


module.exports = {
    accessChat,
    fetchChats,
    fetchGroup,
    createGroupChat,
    groupExit,
    deleteGroup,
    addSelfToGroup,
    removeFriend
}
