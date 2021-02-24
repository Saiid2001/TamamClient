const {SERVER_ADDRESS} = require('../config/settings.json')
const io = require('socket.io-client')

let socket = null;

async function connectSocket(onSuccess) {
    socket = io.connect(SERVER_ADDRESS)
    socket.on('connect', onSuccess)
}


module.exports = {
    connectSocket
}