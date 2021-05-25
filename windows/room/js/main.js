
const socket = require('../../services/socket-service')
let canvasController

const { logout } = require('../../services/auth-service')

const { getUserData } = require('../../services/user-service')

let roomData = null;
let myRoom;

function getUrlData() {
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}
document.addEventListener('DOMContentLoaded', () => {


    getUserData(myUserData => {

    
    const { ipcRenderer } = require('electron')
    const rooms = require('../../services/room-service')

    rooms.getRooms({ '_id': getUrlData()['room'] }, (rooms) => {
        console.log(getUrlData()['room'])
        roomData = rooms[0]
        onRoom(rooms[0]['_id'])
    })

    
    


    function onRoom(roomId) {
        createApp()
        socket.connectSocket(() => {
            console.log('connected to socket')

            myRoom = new Room(conf)
            myRoom.build(scene)

            socket.onUserEnteredRoom(({ user }) => {
                console.log("user joined : ", user)
                uuser = new User(user)
                myRoom.addUser(uuser)

            })

            socket.onUserLeftRoom((userId) => {

            })

            socket.onDisconnect(() => {
                console.log('disconnected')
            })

            socket.enterRoom(roomId, users => {
                users.forEach((user, i) => {
                    console.log("user existing:", user)
                })

                users = users.map(user => {return new User(user)})

                myRoom.loadUsers(users)

                myUser = new MyUser(myUserData)

                myRoom.addUser(myUser)

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

})


