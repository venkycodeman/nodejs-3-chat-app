const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000 
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection',(socket)=>{
    console.log('A new web socket connection')
   
    socket.on('join',(options, callback)=>{
        const {user, error} = addUser({id:socket.id, ...options})
        
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        
        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.userName} has Joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
        callback()


    })
    
    socket.on('sendMessage',(msg, callback)=>{
            const user = getUser(socket.id)
            const filter = new Filter()

            if(filter.isProfane(msg)){
                return callback('Profanity is not allowed')
            }
            io.to(user.room).emit('message',generateMessage(user.userName,msg))
            callback('delivered')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.userName} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        console.log(user)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
})


server.listen(port,()=>{
    console.log('server is up and running')
})
