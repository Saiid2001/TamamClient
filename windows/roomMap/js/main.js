const { ipcRenderer } = require('electron');



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

    console.log(urlData['source']);
    rooms.getRooms({ 'open': '' }, (rooms) => {

        if (urlData['source'] == 'recommendation') {

            showRooms(document.querySelector('.recommended'), rooms, `Recommended Rooms`);

        } else if (urlData['source'] == 'search') { 

            showRooms(document.querySelector('.recommended'), searchRooms(rooms, urlData['extra-params']), `Search results for "${urlData['extra-params']}"`)

        } else if (urlData['source'] == 'default') {
            
            showSearch(document.querySelector('.recommended'));

        }
    })

    ipcRenderer.on('socketConnection', () => {
        console.log("Connected to socket")

        ipcRenderer.on('user-joined-room-to-map', (e,data) => {
            if (data.room != "NONE") {
                console.log(data)
                console.log(`User ${data.user} joined room ${data.room}`)
                map.addUserToRoom(data.user, data.room);
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
                createRequestEntry(users[0], requestslist);
            }, { "_id": data['user'] });
        })

        ipcRenderer.send('socketListener', 'new-friend-request')

        ipcRenderer.on('friend-request-accepted', (e,data) => {
            console.log('friend request has been accepted')
            initializeLists(onlinefriends, offlinefriends, requestslist);
        })

        ipcRenderer.send('socketListener', 'friend-request-accepted')

        ipcRenderer.send('socketEmit', 'EnterMap')
    });

    ipcRenderer.send('socketConnection')

    
})