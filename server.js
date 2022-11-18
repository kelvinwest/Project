//create express server
const express = require('express')
//variable to run express function
const app=express()
//create server to be used with socketio
const server = require('http').Server(app)
//pass server to socket io so that it knows what server we're using and how to interact with it
const io = require('socket.io')(server)

const { v4:uuidV4} = require ('uuid')

//render view engine with ejs library
app.set('view engine','ejs')
//javascript and css files stored in public folder
app.use(express.static('public'))

//no homepage for this application, so we create a room and direct users to that room
app.get('/',(req,res) => {
res.redirect(`/${uuidV4()}`)
})

//dynamic room parameter to pass to url
app.get('/:room',(req,res)=>{
   res.render('room',{roomId: req.params.room}) 
})

//runs anytime someone connects to the webpage, sets up events to listen to
io.on('connection', socket => {
   //pass room and id user id and call code inside socket.on
   socket.on('join-room',(roomId, userId)=>{
      //send anything that happens in this roomId to this socket
      socket.join(roomId)
      //send message to everyone in this roomId except self
      socket.to(roomId).emit('user-connected', userId)

      //when a user disconncects from server, this function will be called
      socket.on('disconnect',()=>{
         //send event to room
         socket.to(roomId).emit('user-disconnected', userId)
      })

      socket.on('message',(message)=>{
         //send event to room
         io.to(roomId).emit('createMessage', message)
      })

   })

})

//start server on port 3000
server.listen(3000)

