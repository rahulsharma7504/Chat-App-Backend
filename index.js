const dotenv = require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http'); 
const socketIo = require('socket.io');
const mongoDB = require('./Config/DB');
const userRoutes = require('./Routes/userRoute');
const User = require('./Model/userModel');
const app = express();
const chatModel = require('./Model/chatModel');
const GroupModel = require('./Model/GroupModel');
const GroupChatModel = require('./Model/GroupChatModel');
const MemberModel = require('./Model/MembersModel');
const server = http.Server(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Your React app's URL
        methods: ["GET", "POST"]
    }
});
// Export io for use in other modules
// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());
app.use(express.json());








// Socket.io connection
// Define a namespace for group chat
const groupNamespace = io.of('/group');

groupNamespace.on('connection', (socket) => {
    console.log('User connected to /group namespace');
// fetch Old Messages

socket.on('fetchOldMessages',async(data)=>{
    const findAllMessages =await GroupChatModel.find({groupId: data.groupId}).populate('Group');
    socket.emit('loadOldMessages',findAllMessages);
    console.log('Old Messages fetched successfully'+findAllMessages);
})
    // When a new message is received
    socket.on('receiveMessage', async (message) => {
        try {

           socket.broadcast.emit('newMessage',(message));
 
 
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('messageError', { success: false, error: 'Message could not be sent' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from /group namespace');
    });
});


// create nameSpace To Sow Status;


const status = io.of('/status'); 

status.on('connection', async (socket) => {

    console.log('User connected', socket.handshake.auth.token);

    const user = await User.findByIdAndUpdate({ _id: socket.handshake.auth.token }, { $set: { is_online: true } });


    socket.on('message', (data) => {
        console.log('Received message', data);
        socket.broadcast.emit('receiveMessage', data);
    })

    socket.on('loadMessage', async (data) => {
        try {
            console.log('Received load chat message:', data); // Log the incoming request data

            const chats = await chatModel.find({
                $or:[
                    { senderId: data.reciverId,receiverId: data.senderId },
                    { senderId: data.senderId,receiverId: data.reciverId }
                ]
            });
            socket.emit('loadChatMessage', chats); // Send chats back to the client
        } catch (error) {
            console.error('Error loading messages:', error); // Log any errors
            socket.emit('loadChatMessage', { error: 'Error loading messages' }); // Optional: Send error back to client
        }
    });




    socket.on('disconnect', async () => {
        console.log('User disconnected by browser', socket.handshake.auth.token);
        const user = await User.findByIdAndUpdate({ _id: socket.handshake.auth.token }, { $set: { is_online: false } });
    });
});
// Routes
app.use('/api', userRoutes);

// Server listening

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});  

