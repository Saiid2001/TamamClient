
const socket = require('../../services/socket-service')
let canvasController

const { logout } = require('../../services/auth-service')

let roomData = null;

document.addEventListener('DOMContentLoaded', () => {

    const { ipcRenderer } = require('electron')
    const rooms = require('../../services/room-service')
    
    rooms.getRooms({ 'name': "Main Gate" }, (rooms) => {
        roomData = rooms[0]
        onRoom(rooms[0]['_id'])
    })

    
    canvasController = new CanvasController(new Canvas())

    let mapButton = document.getElementById('map');
    mapButton.addEventListener('click', () => {
        ipcRenderer.send('go-to-roommap', 'default', '');
    });

    function onRoom(roomId) {
        socket.connectSocket(() => {
            console.log('connected to socket')

            socket.onUserEnteredRoom(({ user }) => {
                console.log("user joined : ", user)
                canvasController.addAvatar(user)

            })

            socket.onUserLeftRoom((userId) => {

                canvasController.removeAvatar(userId)
            })

            socket.onDisconnect(() => {
                console.log('disconnected')
                canvasController.clear();
            })

            socket.enterRoom(roomId, users => {
                console.log(users)
                users.forEach((user, i) => {

                    console.log("user existing:", user)
                    canvasController.addAvatar(user)
                })
            });

            document.dispatchEvent(new Event('connected-to-socket'))
        })




        //event listeners

        //if user is requesting a call
        document.addEventListener('request-call', e => {
            ipcRenderer.send('request-call', e.detail.UID)
        })

    }

})


