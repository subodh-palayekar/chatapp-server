const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema =  mongoose.Schema(
    {
        name : {
            type : String,
            required:true,
        },

        email :{
            type : String,
            required:true,
        },

        password : {
            type : String,
            required:true,
        },
        isAdmin : {
            type : Boolean,
            
        },
        username : {
            type : String,
            required:true,
        },
        friends:[{
            type : mongoose.Schema.Types.ObjectId,
            ref:"User",
        }],
    },
    {
        timestamps:true,
    }  
);


userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

userSchema.pre("save",async function(next){
    try{

        if(!this.isModified("password")){
            next();
        }
        
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password,salt);

    }catch(e){
        console.log(e);
    }
})



const User = mongoose.model('User',userSchema);

module.exports = User;