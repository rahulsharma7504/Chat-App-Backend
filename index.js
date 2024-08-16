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
const server = http.Server(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Your React app's URL
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(bodyParser.json());
app.use(express.json());








// Socket.io connection
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

