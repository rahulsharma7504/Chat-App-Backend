const express=require('express');
const userRoute=express();
const multer=require('multer');
const {validate}=require('../Middleware/Validator');
const path=require('path');
const {validationResult}=require('express-validator');



const storage=multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});



const upload=multer({storage: storage});


const userController=require('../Controller/userController');   
const groupController=require('../Controller/groupController');   




userRoute.post('/register',upload.single('image'),validate,userController.Register);
userRoute.post('/login',userController.Login);

userRoute.post('/users',userController.getAllUsers);
userRoute.post('/user/info',userController.userInfo);
userRoute.post('/user',userController.SearchUser)
userRoute.post('/chatUser',userController.chatUser)
userRoute.post('/message/:id',userController.deleteMessage)
userRoute.post('/updatemessage',userController.updateMessage)


//Handle Groups Request

userRoute.post('/group/create',upload.single('image'),groupController.createGroup);
userRoute.get('/group/getUsers/:id',groupController.getUsersInGroup);
userRoute.post('/group/addUsers',groupController.AddUser_group);

// userRoute.post('/group/addUser',groupController.addUserToGroup);
// userRoute.post('/group/removeUser',groupController.removeUserFromGroup);
// userRoute.post('/group/getMessages',groupController.getGroupMessages);

module.exports=userRoute;






