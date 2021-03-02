
const { connectSocket, onUserEnteredRoom, enterRoom, getSocket, onDisconnect } = require('../../services/socket-service')
let canvasController

const { logout } = require('../../services/auth-service')



document.addEventListener('DOMContentLoaded', () => {

    const { ipcRenderer } = require('electron')

    canvasController = new CanvasController(new Canvas())

    //for (var i = 0; i < 40; i++) {
     //   canvasController.addAvatar({ id: i, avatar: {} })
    //    console.log('added')
    //}

    connectSocket(() => {
        console.log('connected to socket')

        onUserEnteredRoom(({ user }) => {
            canvasController.addAvatar({ id: user, avatar: {} })
        })

        onDisconnect(() => {
            console.log('disconnected')
            canvasController.clear();
        })
        enterRoom('lobby', users => {
            console.log(users)
            users.forEach((user, i) => {
                canvasController.addAvatar({ id: user, avatar: {} })
            })
        });
    })

    


    //event listeners

    //if user is requesting a call
    document.addEventListener('request-call', e => {
        ipcRenderer.send('request-call', e.detail.UID)
    })

})
