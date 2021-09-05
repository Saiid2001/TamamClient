const {SERVER_ADDRESS} = require('../config/settings.json')
const io = require('socket.io-client')
const { ipcRenderer } = require('electron');
const { getAccessToken } = require('./auth-service');

var socket = null;

function getSocket() {
    return socket;
}


function getToken(){
    let token;
    if(ipcRenderer)
      token = ipcRenderer.sendSync('get-access-token');
    else
      token = getAccessToken();
    
      return token;
}

function resetSocketListeners(){
    if(socket && socket.connected){
        socket.removeAllListeners()

    }
}
function connectSocket(onSuccess) {
    const token = getToken();
    
    

    if(!socket){

    console.log('Connecting socket ')
    
    socket = io(SERVER_ADDRESS, {
        extraHeaders: {
            Authorization: "Bearer " + token

        },
        autoConnect: false
    })

    socket.on('connect', ()=>{
        console.log('Connected socket ', socket.id)
        onSuccess();
    })

    socket.on('error', ()=>{
        console.log('Error Connecting Socket')
    })

    socket.connect();

    }else{
        console.log('Connected socket ', socket.id)
        onSuccess();
    }
}

function enterRoom(roomID, callback = () => { }) {
    socket.emit('join', { room: roomID }, callback = callback)
}
function exitRoom(roomID, callback = () => { }) {
    socket.emit('leave', callback = callback)
}

function enterGroup(id, callback = () => { }) {
    socket.emit('join-group', { group: id }, callback = callback)
}
function exitGroup(id, callback = () => { }) {
    socket.emit('leave-group', callback = callback)
}

function enterCall(id, callback = () => { }) {
    socket.emit('join-call', { room: id }, callback = callback)
}

function enterMap(callback = () => { }) {
    socket.emit('enter-map', callback = callback)
}

function onUserEnteredRoom(callback) {
    socket.on('user-joined-room', ({ user }) => {
            callback({ user: user })
       
    })
}

function onUserLeftRoom(callback) {
    socket.on('user-left-room', ({ user }) => {
        console.log(`user: ${user} left the room`)
        callback(user)

    })
}

function onUserEnteredGroup(callback) {
    socket.on('user-joined-group', (data) => {
        console.log(`user: ${data.user} joined the group ${data.group}`)
        callback(data.user, data.group)

    })
}

function onUserLeftGroup(callback) {
    socket.on('user-left-group', (data) => {
        console.log(`user: ${data.user} left the group ${data.group}`)
        callback(data.user,data.group )

    })
}



function onDisconnect(callback) {
    socket.on("disconnect", callback)
}

function on(event, callback, namespace = null) {
    if (namespace) {
        let nsp = socket.of(namespace)
        nsp.on(event, message => { callback(JSON.parse(message)) })
    }
    else {
       
        socket.on(event, message => { console.log(message); callback(message) })
    }
}

function sendMessage(message, namespace=null) {
    console.log('Sending message: ' + message.id);
    if (namespace) {
        let nsp = socket.of(namespace)
        nsp.emit(JSON.stringify(message))
    } else {
        socket.send(JSON.stringify(message))
    }
    
}

module.exports = {
    connectSocket,
    onUserEnteredRoom,
    onUserLeftRoom,
    onUserEnteredGroup,
    onUserLeftGroup,
    enterRoom,
    exitRoom,
    enterCall,
    enterMap,
    getSocket,
    onDisconnect,
    on,
    sendMessage,
    enterGroup,
    exitGroup,
    socket,
    resetSocketListeners
}