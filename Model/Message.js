const mongoose=require('mongoose');
const messageSchema=mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    message:{
        type:String,
        required:true,
        ref:'Chat'
    },
   

},{
    timestamps:true,
 
})

module.exports=mongoose.model('Message',messageSchema);