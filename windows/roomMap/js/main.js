
const $ = require('jquery')
const { ipcRenderer } = require('electron');
const PIXI = require('pixi.js');
const rooms = require('../../services/room-service');
const users = require('../../services/user-service.js');

const bitmoji_service = require('../../services/bitmoji-service')

function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

let urlData = getUrlData();

document.addEventListener('DOMContentLoaded', () => {

    const map = new GlobalMap(
        document.getElementById('map'),
        './assets/map.jpg',
    );

    $('#friends-bar-widget').load('../../widgets/friends_bar/friends_bar.html', () => {
        friendsBar.init();
    });

    initializeRecommended(urlData);

    ipcRenderer.on('socketConnection', () => {
        console.log("Connected to socket")

        ipcRenderer.on('user-joined-room-to-map', (e,data) => {
            if (data.room != "NONE") {
                console.log(data)
                console.log(`User ${data.user} joined room ${data.room}`)
                users.getFriends((friends) => {
                    console.log(data.user["_id"])
                    if (friends.find(friend => friend["_id"] == data.user["_id"]) != undefined) {
                        
                        map.addUserToRoom(data.user, data.room);
                    }
                })
            }
        })

        ipcRenderer.send('socketListener', 'user-joined-room-to-map')

        ipcRenderer.on('user-left-room-to-map', (e,data) => {
            if (data.room != "NONE") {
                console.log(data);
                console.log(`User ${data.user} left room ${data.room}`);
                map.removeUserFromRoom(data.user, data.room);
            }
        })

        ipcRenderer.send('socketListener', 'user-left-room-to-map')

        ipcRenderer.on('new-friend-request', (e,data) => {
            console.log('new friend request')
            users.getAllUsers((users) => {
                friendsBar.createRequestEntry(users[0]);
            }, { "_id": data['user'] });
        })

        ipcRenderer.send('socketListener', 'new-friend-request')

        ipcRenderer.on('friend-request-accepted', (e,data) => {
            console.log('friend request has been accepted')
            friendsBar.initializeLists(friendsBar.friendSearch.data);
        })

        ipcRenderer.send('socketListener', 'friend-request-accepted')

        ipcRenderer.send('socketEmit', 'EnterMap')
    });

    ipcRenderer.send('socketConnection')


    users.getUserData(myUser=>{
        $("#profile-preview h2").html(myUser.firstName+" "+myUser.lastName)
        document.querySelector('#profile-preview img').src = bitmoji_service.getAvatarImage(
            myUser.avatar,
            myUser.gender,
            'head'
        )
        document.querySelector('#profile-preview').addEventListener('click', ()=>{
            //ipcRenderer.send('go-to-roommap',urlData.source, urlData['extra-params'] )
            ipcRenderer.send('go-to', 'settings' )
        })

    })

    
})