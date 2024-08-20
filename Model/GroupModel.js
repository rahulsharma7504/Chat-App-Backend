const mongoose=require('mongoose');
const groupSchema=mongoose.Schema({
   createrId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'User'
   },
   name:{
     type:String,
     required:true,
   },
   image:{
     type:String,
     },
   limit:{
     type:Number,
     required:true,
     default:8
   }


},{
    timestamps:true
})

module.exports=mongoose.model('Group',groupSchema);