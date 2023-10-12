const express = require("express");
const app = express();
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes")
const chatRoutes = require("./routes/chatRoutes")
const messageRoutes = require("./routes/messageRoutes")
const cors = require("cors")


dotenv.config()
const PORT = process.env.PORT || 5000;
require('./DB/connection');
app.use(cors())
app.use(express.json())
app.use("/user",userRoutes);
app.use("/chat",chatRoutes);
app.use("/message",messageRoutes);



app.get('/',(req,res)=>{
    res.send(" App start")
})


const server = app.listen(PORT,()=>{console.log(`server is running on ${PORT}`);});

const io = require("socket.io")(server,{
    cors:{
        origin:"*",
    },
    pingTimeout:60000,
})

io.on("connection",(socket)=>{
    socket.on("setup",(user)=>{
        socket.join(user._id);
        socket.emit("connected");
    })

    socket.on("join chat",(room)=>{
        socket.join(room);
    });

    socket.on("new message",(newMessageStatus)=>{
        var chat = newMessageStatus.chat;
        if(!chat.users){
            return console.log("chat.users not defined");
        }
        chat.users.forEach((user)=>{
            if(user._id == newMessageStatus.sender._id) return;

            socket.in(user._id).emit("message received",newMessageRecieved)
        })
    })
})
