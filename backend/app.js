const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log('Connected To MongoDB'))
    .catch(err => console.error('MongoDb Connection Error: ',err));
 
const messageSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    message:{
        type: String,
        required: true
    },
    timestamp: { // Fixed: was 'timestamps', now 'timestamp'
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('message',messageSchema);

app.get('/',(req,res)=>{
    res.send('Chat App server is running')
});

app.get('/api/test',(req,res)=>{
    res.json({message: 'Api is working'});
});

app.get('/api/messages',async (req,res)=>{
    try{
        const message = await Message.find().sort({ timestamp: 1 });
        res.json({message});
    } catch(error){
        res.status(500).json({ error: 'Failed to get messages'});
    }
});

app.post('/api/messages', async(req,res)=>{
    try{
        const { username, message } = req.body;
        const newMessage = new Message({
            username,
            message
        });
        await newMessage.save();
        res.json({ success: true, message: newMessage});
    } catch(error){
        res.status(500).json({error: 'Failed to get message'})
    }
})

// Socket.io connection handling
io.on('connection', (socket)=>{
    console.log('New Client Connected:', socket.id);

    // Send previous messages when user connects
    socket.on('get messages', async () => {
        try {
            const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
            socket.emit('previous messages', messages);
        } catch (error) {
            console.log('Error getting messages:', error);
        }
    });

    // Handle new message from client
    socket.on('send message', async (data) => {
        try {
            const newMessage = new Message({
                username: data.username,
                message: data.message
            });
            
            await newMessage.save();
            
            // Send message to all connected clients
            io.emit('new message', {
                username: data.username,
                message: data.message,
                timestamp: newMessage.timestamp
            });
        } catch (error) {
            console.log('Error saving message:', error);
        }
    });

    // Handle typing events
    socket.on('typing', (data) => {
        socket.broadcast.emit('user typing', data);
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('user stop typing', data);
    });

    socket.on('disconnect', ()=>{
        console.log('Client disconnected:', socket.id);
    });
});

// ONLY use server.listen (removed app.listen)
server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});