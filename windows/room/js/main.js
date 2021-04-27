
const socket = require('../../services/socket-service')
let canvasController

const { logout } = require('../../services/auth-service')

let roomData = null;

function getUrlData() {
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}
document.addEventListener('DOMContentLoaded', () => {

    const { ipcRenderer } = require('electron')
    const rooms = require('../../services/room-service')

    rooms.getRooms({ '_id': getUrlData()['room'] }, (rooms) => {
        console.log(getUrlData()['room'])
        roomData = rooms[0]
        onRoom(rooms[0]['_id'])
    })

    
    


    function onRoom(roomId) {
        canvasController = new CanvasController(new Canvas())
        createApp()
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

            document.getElementById('room-title').innerHTML = roomData['name']
            document.getElementById('exit-room').onclick = () => {
                let r = ipcRenderer.send('go-to', 'roomMap')
            }
        })




        //event listeners

        //if user is requesting a call
        document.addEventListener('request-call', e => {
            ipcRenderer.send('request-call', e.detail.UID)
        })

    }

})


