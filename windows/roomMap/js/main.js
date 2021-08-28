const socket = require('../../services/socket-service');
const $ = require('jquery')


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

    socket.connectSocket(() => {
        console.log("Connected to socket")

        socket.getSocket().on('user-joined-room-to-map', (data) => {
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

        socket.getSocket().on('user-left-room-to-map', (data) => {
            if (data.room != "NONE") {
                console.log(data);
                console.log(`User ${data.user} left room ${data.room}`);
                map.removeUserFromRoom(data.user, data.room);
            }
        })

        socket.getSocket().on('new-friend-request', (data) => {
            console.log('new friend request')
            users.getAllUsers((users) => {
                friendsBar.createRequestEntry(users[0]);
            }, { "_id": data['user'] });
        })

        socket.getSocket().on('friend-request-accepted', (data) => {
            console.log('friend request has been accepted')
            friendsBar.initializeLists(friendsBar.friendSearch.data);
        })

        socket.enterMap();
    });

    
})