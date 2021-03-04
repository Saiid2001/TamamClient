const {SERVER_ADDRESS} = require('../config/settings.json')
const io = require('socket.io-client')
const { ipcRenderer } = require('electron')

var socket = null;

function getSocket() {
    return socket;
}

function connectSocket(onSuccess) {
    const token  = ipcRenderer.sendSync('get-access-token');
    socket = io.connect(SERVER_ADDRESS, {
        extraHeaders: {
            Authorization: "Bearer " + token

        }
    })
    socket.on('connect', onSuccess)
}

function enterRoom(roomID, callback = () => { }) {
    socket.emit('join', { room: roomID }, callback = callback)
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

function onDisconnect(callback) {
    socket.on("disconnect", callback)
}

module.exports = {
    connectSocket,
    onUserEnteredRoom,
    onUserLeftRoom,
    enterRoom,
    getSocket,
    onDisconnect
}