const mongoose=require('mongoose');
const groupChatSchema=mongoose.Schema({
   senderId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'User'
   },
   groupId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Group'
   },
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
   message:{
     type:String,
     required:true
   }


},{
    timestamps:true
})

module.exports=mongoose.model('GroupChat',groupChatSchema);