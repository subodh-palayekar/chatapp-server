const Message = require("../models/messageModel")
const User = require("../models/userModel")
const Chat = require("../models/chatModel") 


const allMessages = async (req,res)=>{
    try {
        const messages = await Message.find({chat:req.params.chatId})
            .populate("sender","name email username")
            .populate("receiver")
            .populate("chat"); 
        res.json(messages)    
    } catch (error) {
        res.status(400)
        console.log(error);
    }
}

const sendMessage = async (req,res)=>{
    const {content,chatId} = req.body;

    if(!content || !chatId){
        return res.status(400).json({messages:"invalid data passed"})
    }

    var newMessage = {
        sender : req.user._id,
        content:content,
        chat:chatId,
    }

    try {
        var message = await Message.create(newMessage);
        console.log(message);
        message = await message.populate("sender","name username pic");
        message = await message.populate("chat");
        message = await message.populate("receiver");
        message = await User.populate(message,{
            path : "chat.users",  
            select : "username email name",
        }) 

        await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage:message});
        res.json(message);
    } catch (error) {
        res.status(400);
    }
}


module.exports = {allMessages,sendMessage}