//get a reference to socket
const socket = io('/')

//get a reference to grid in front end
const videoGrid = document.getElementById('video-grid')

//since we're connecting to own server, need to pass some parameter to new peer 
//undefined because server will handle the id generation
const myPeer = new Peer(undefined,{
    host:'/',
    port:'3001'
})

let myVideoStream;

//get a reference to a video element we create
const myVideo = document.createElement('video')

//mute our own videe, it doesn't mute other people
myVideo.muted = true

const peers ={}

//connect our video
navigator.mediaDevices.getUserMedia({ 
    video:true,
    audio:true
}).then(stream=>{
    myVideoStream=stream;
    addVideoStream(myVideo,stream)
    
    //answer call when a user calls us
    myPeer.on('call',call =>{
       call.answer(stream) 

       const video = document.createElement('video')


       call.on('stream',userVideoStream =>{
        addVideoStream(video,userVideoStream)

       })
    })

    //when a new user joins the room
    socket.on('user-connected',userId=>{
        console.log('user connected',userId)
        setTimeout(connectToNewUser,1000,userId,stream)
        //connectToNewUser(userId,stream)
    })

      // input value
  let text = $("input");
  
  // when you press enter send message to server
  $('html').keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
  }
  });
  
  //append the message we type to front end
  socket.on("createMessage", message => {
      $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom()
  });
})


socket.on('user-disconnected',userId=>{
    console.log('user disconnected',userId)
    if (peers[userId]) peers[userId].close()
})


//as soon as we connect to peer server and get back an id, run the code inside this
myPeer.on('open',id=>{
    //send an event to our server when joining a room
    socket.emit('join-room', ROOM_ID, id)
})


function connectToNewUser(userId,stream){
    //calling user with that id and sending them the stream
    const call = myPeer.call(userId,stream)
    

    const video = document.createElement('video')

    //take in stream that the user sends in return and add to our custom video object
    call.on('stream',userVideoStream=>{
       addVideoStream(video, userVideoStream) 
    })
    //when someone leaves the call, we remove video
    call.on('close',() =>{
        video.remove()
    })

   peers[userId] = call
}

const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
  }


//function to tell our video object we created to use stream
function addVideoStream(video, stream){
    //set video object to stream allowing us to play the video
    video.srcObject = stream
    video.addEventListener('loadedmetadata',() => {
        video.play()
    })
    videoGrid.append(video)
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }

  //change html unmute to mute
  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  //change html unmute to mute
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }

  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setShowCamera()
    } else {
      setHideCamera()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  const setHideCamera = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Hide Camera</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setShowCamera = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Show Camera</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }


