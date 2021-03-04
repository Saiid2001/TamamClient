
const socket = require('../../services/socket-service')
let canvasController

const { logout } = require('../../services/auth-service')


document.addEventListener('DOMContentLoaded', () => {

    const { ipcRenderer } = require('electron')

    canvasController = new CanvasController(new Canvas())

    

    socket.connectSocket(() => {
        console.log('connected to socket')

        socket.onUserEnteredRoom(({ user }) => {
            canvasController.addAvatar(user)
            
        })

        socket.onUserLeftRoom((userId) => {
            
            canvasController.removeAvatar(userId)
        })

        socket.onDisconnect(() => {
            console.log('disconnected')
            canvasController.clear();
        })

        socket.enterRoom('lobby', users => {
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


