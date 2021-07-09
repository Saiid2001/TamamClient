
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

let urlData = getUrlData();

document.addEventListener('DOMContentLoaded', () => {


    getUserData(myUserData => {

    
    const { ipcRenderer } = require('electron')
    const rooms = require('../../services/room-service')

    rooms.getRooms({ '_id': urlData['room'] }, (rooms) => {
        console.log(urlData['room'])
        roomData = rooms[0]
        console.log(roomData);
        console.log(rooms[0]['_id'], rooms[0]['layout']);
        onRoom(rooms[0]['_id'], rooms[0]['layout'])
    })

    
    



    function onRoom(roomId, roomConf) {
        createApp(roomConf)
        
        socket.connectSocket(() => {
            
            console.log('connected to socket')

            myRoom = new Room(roomConf)
            myRoom.build(scene)

            socket.onUserEnteredRoom(({ user }) => {
                console.log("user joined : ", user)
                uuser = new User(user)
                myRoom.addUser(uuser)

            })

            socket.onUserLeftRoom((userId) => {
                console.log("user left : ", userId)
                uuser = myRoom.findUser(userId)
                myRoom.removeUser(uuser)
            })

            socket.onUserEnteredGroup((user, group ) => {

                var uuser = myRoom.findUser(user)
                if (uuser && uuser.id != myUser.id) {
                    var loc = myRoom.findObj(null, group)
                    myRoom.moveUser(uuser, loc)

                    if (uuser.group == myUser.group) {

                        if(!myConversationInterface.isOpen){
                        myConversationInterface.open(uuser.group, loc.users, false);
                        }else{
                            myConversationInterface.__addUserToCall(uuser.id);
                        }
                    }

                    if(myConversationInterface.remoteUsers && uuser.id in myConversationInterface.remoteUsers){
                        myConversationInterface.__removeUserFromCall(uuser.id);
                    }

                    if (myRoom.findObj(null, myUser.group).users.length == 1 && myConversationInterface.isOpen) {
                        myConversationInterface.close()
                    }

                    
                }


            })

            socket.onUserLeftGroup((user, group) => {
                console.log("user left group", group, ": ", user)
            })

            socket.getSocket().on('waving-to-group', (event)=>{
                showNotification(`${myRoom.findUser(event.user).firstName} is trying to join your table!`, {'confirm': ()=>{
                    socket.getSocket().emit("accepted-to-group", {user: event.user, room: myUser.group});
                    hideNotification(event.user);
                },
                'cancel': ()=>{
                    socket.getSocket().emit("rejected-from-group", {user: event.user, room: myUser.group});
                    hideNotification(event.user);
                }
                },
                event.user
                )
            })
            
            socket.getSocket().on('accepted-to-group', (event)=>{
            
                if(event.user == myUser.id && event.room == myUser.wavingTo){
                    showNotification(`They waved back. Have fun!!`, {})
                    myUser.waveToCallback();
                    myUser.waveToCallback = null;
                    myUser.wavingTo = null;
                    setTimeout(()=>hideNotification(), 5000);
                }

                else if(event.user != myUser.id && event.room == myUser.wavingTo){
                    hideNotification(event.user)
                }
            
            })
            
            socket.getSocket().on('rejected-from-group', (event)=>{
                if(event.room == myUser.wavingTo){
                    showNotification(`Oups! they seem to be busy at the moment!`, {})
                    myUser.waveToCallback = null;
                    myUser.wavingTo = null;
                    setTimeout(()=>hideNotification(), 5000);
                }
            })
            
            socket.getSocket().on('canceled-waving', (event)=>{
                
                    showNotification(`Oups ${myRoom.findUser(event.user).firstName} decided to leave.}`, {}, event.user)
                    setTimeout(()=>hideNotification(event.user), 5000);
                
            })

            socket.onDisconnect(() => {
                console.log('disconnected')
            })

            socket.enterRoom(roomId, users => {
                users.forEach((user, i) => {
                    console.log("user existing:", user)
                })

                users = users.map(user => {return new User(user)})

                console.log("My user", myUserData)
                myUser = new MyUser(myUserData)

                myRoom.loadUsers(users)

                myRoom.addUser(myUser,null, myUserData.group)

            });

            document.dispatchEvent(new Event('connected-to-socket'))

            document.getElementById('room-title').innerHTML = roomData['name']
            document.getElementById('exit-room').onclick = () => {
                myConversationInterface.close()
                let r = ipcRenderer.send('go-to-roommap', urlData['return-data']['source'], urlData['return-data']['extra-params'])
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


