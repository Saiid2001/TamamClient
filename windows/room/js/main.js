
//const socket = require('../../services/socket-service')
let canvasController
const { logout } = require('../../services/auth-service')
const { getUserData } = require('../../services/user-service')
const rooms = require('../../services/room-service')
const bitmoji_service = require('../../services/bitmoji-service')

const $ = require('jquery');

let roomData = null;
let myRoom;
let urlData;

function getUrlData() {
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

document.addEventListener('DOMContentLoaded', () => {

    urlData = getUrlData();

    $('#user-hover-view').load('../../widgets/hover_view/user_hover.html',()=>{
        UserHoverView.init();
    })
    
    $('#friends-bar-widget').load('../../widgets/friends_bar/friends_bar.html', () => {
        friendsBar.init();
    });

    getUserData(myUserData => {

    const { ipcRenderer } = require('electron')
    rooms.getRooms({ '_id': urlData['room'] }, (rooms) => {
        roomData = rooms[0]
        onRoom(rooms[0]['_id'], rooms[0]['layout'])
    })

    function onRoom(roomId, roomConf) {
        console.log('got room')
        createApp(roomConf,()=>{

        
        ipcRenderer.on('socketConnection', () => {
            
            console.log('connected to socket')

            myRoom = new Room(roomConf)
            myRoom.build(scene)

            ipcRenderer.on('UserEnteredRoom', (event, { user }) => {
                console.log("user joined : ", user)

                let uuser = myRoom.findUser(user._id)
                if(uuser)
                    myRoom.removeUser(uuser)

                uuser = new User(user)
                myRoom.addUser(uuser)

            })

            ipcRenderer.send('socketListener', 'UserEnteredRoom')

            ipcRenderer.on('UserLeftRoom',(event, userId) => {
                console.log("user left : ", userId)
                uuser = myRoom.findUser(userId)
                myRoom.removeUser(uuser)
            })

            ipcRenderer.send('socketListener', 'UserLeftRoom')

            ipcRenderer.on('UserEnteredGroup',(event, user, group ) => {

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

            ipcRenderer.send('socketListener', 'UserEnteredGroup')

            ipcRenderer.on('waving-to-group', (e, event)=>{
                showNotification(`${myRoom.findUser(event.user).firstName} is trying to join your table!`, {'confirm': ()=>{
                    ipcRenderer.send('socketEmit', "accepted-to-group", {user: event.user, room: myUser.group});
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

            ipcRenderer.send('socketListener', 'waving-to-group')
            
            ipcRenderer.on('accepted-to-group', (e, event)=>{
            
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

            ipcRenderer.send('socketListener', 'accepted-to-group')
            
            ipcRenderer.on('rejected-from-group', (e, event)=>{
                if(event.room == myUser.wavingTo){
                    showNotification(`Oups! they seem to be busy at the moment!`, {})
                    myUser.waveToCallback = null;
                    myUser.wavingTo = null;
                    setTimeout(()=>hideNotification(), 5000);
                }
            })

            ipcRenderer.send('socketListener', 'rejected-from-group')
            
            ipcRenderer.on('canceled-waving', (e, event)=>{
                
                    showNotification(`Oups ${myRoom.findUser(event.user).firstName} decided to leave.}`, {}, event.user)
                    setTimeout(()=>hideNotification(event.user), 5000);
                
            })

            ipcRenderer.send('socketListener', 'canceled-waving')

            ipcRenderer.on('EnterRoom', (event, users) => {
                users.forEach((user, i) => {
                    console.log("user existing:", user)
                })

                users = users.map(user => {return new User(user)})

                console.log("My user", myUserData)
                myUser = new MyUser(myUserData)

                myRoom.loadUsers(users)

                myRoom.addUser(myUser,null, myUserData.group)

            });

            ipcRenderer.send('socketEmit', 'EnterRoom', {"roomId": roomId})

            document.dispatchEvent(new Event('connected-to-socket'))

            document.getElementById('room-title').innerHTML = roomData['name']
            document.getElementById('exit-room').onclick = () => {
             myConversationInterface.close()
                let r = ipcRenderer.send('go-to', 'roomMap', { source: urlData['return-data']['source'], 'extra-params': urlData['return-data']['extra-params'] })
            }
            
        })

        ipcRenderer.send('socketConnection');

        getUserData(myUser=>{
            $("#profile-preview h2").html(myUser.firstName+" "+myUser.lastName)
            document.querySelector('#profile-preview img').src = bitmoji_service.getAvatarImage(
                myUser.avatar,
                myUser.gender,
                'head'
            )
             document.querySelector('#profile-preview').addEventListener('click', ()=>{
                 //ipcRenderer.send('go-to-roommap',urlData.source, urlData['extra-params'] )
                 ipcRenderer.send('go-to', 'settings', { window: 'room', 'return-data': urlData } )
             })
    
        })

    })

        

        }

    })

})


