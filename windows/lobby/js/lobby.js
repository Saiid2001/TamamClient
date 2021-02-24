const { connectSocket } = require('../../services/socket-service')


document.addEventListener('DOMContentLoaded', () => {

    connectSocket(() => {
        console.log('connected to socket')
    })


})