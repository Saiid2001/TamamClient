const {SERVER_ADDRESS} = require('../config/settings.json')
const io = require('socket.io-client')
const {getAccessToken} = require('../services/auth-service')

var socket = null;

function getSocket() {
    return socket;
}

async function connectSocket(onSuccess) {
    const token = await getAccessToken();
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