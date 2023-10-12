const mongoose = require("mongoose");

const URI = process.env.DATABASE;


const connect = async ()=>{
    try{
        await mongoose.connect(URI)
        console.log("connection successful");
    }catch(e){
        console.log("no connection" , e)
    }
}

connect();
