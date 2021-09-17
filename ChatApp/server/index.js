const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { 
    cors: ['http://localhost:3000', 'https://admin.socket.io/'],
});

const router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5050;

io.on('connection', socket => {

    socket.on('join', ({ name, room }, cb) => {
        const { error, user } = addUser({
            id: socket.id,
            name,
            room,
        })
        if(error) {
            return cb(error);
        }
        socket.join(user.room);

        socket.emit('message', {user: 'admin', text: `Hey! ${user.name}.`});

        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} joined.` });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    })

    socket.on('sendMessage', (message, cb) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData',  { room: user.room, users: getUsersInRoom(user.room) });

        cb();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
        }
    })
})

app.use(router);

server.listen(PORT, ()=>{
    console.log(`Server running: ${PORT}`);
})