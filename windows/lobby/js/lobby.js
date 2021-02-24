
const { connectSocket, onUserEnteredRoom, enterRoom, getSocket, onDisconnect } = require('../../services/socket-service')
let canvasController

const {logout} = require('../../services/auth-service')

document.addEventListener('DOMContentLoaded', () => {

    connectSocket(() => {
        console.log('connected to socket')
        enterRoom('lobby');
    })

    const { ipcRenderer } = require('electron')

    canvasController = new CanvasController(new Canvas())

    //for (var i = 0; i < 40; i++) {
     //   canvasController.addAvatar({ id: i, avatar: {} })
    //    console.log('added')
    //}

    onUserEnteredRoom(({ user }) => {
        canvasController.addAvatar({ id: user, avatar: {} })
        console.log(user)
    })

    onDisconnect(() => {
        console.log('disconnected')
        canvasController.clear();
    })


    //event listeners

    //if user is requesting a call
    document.addEventListener('request-call', e => {
        ipcRenderer.send('request-call', e.detail.UID)
    })

})
