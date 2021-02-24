const {SERVER_ADDRESS} = require('../config/settings.json')
const io = require('socket.io-client')

var socket = null;

function getSocket() {
    return socket;
}

function getUserId() {
    return socket.io.engine.id
}

function connectSocket(onSuccess) {
    socket = io.connect(SERVER_ADDRESS)
    socket.on('connect', onSuccess)
}

function enterRoom(roomID) {
    socket.emit('join', { user: getUserId(), room: roomID })
}

function onUserEnteredRoom(callback) {
    socket.on('user-joined-room', ({ user }) => {
        if (user != getUserId()) {
            callback({ user: user })
        } else {
            
        }
    })
}

function onDisconnect(callback) {
    socket.on("disconnect", callback)
}

module.exports = {
    connectSocket,
    onUserEnteredRoom,
    enterRoom,
    getSocket,
    onDisconnect
}