const mongoose=require('mongoose');
const memberSchema=mongoose.Schema({
   groupId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Group'
   },
  
   userId:{
     type:String,
     ref:'User'
   },


},{
    timestamps:true
})

module.exports=mongoose.model('Member',memberSchema);