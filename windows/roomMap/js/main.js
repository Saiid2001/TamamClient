const socket = require('../../services/socket-service');


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

            showRooms(document.querySelector('.recommended'), searchRooms(rooms, urlData['extra-params']), `Results for search: ${urlData['extra-params']}`)

        } else if (urlData['source'] == 'default') {
            
            showSearch(document.querySelector('.recommended'), rooms);

        }
    })

    socket.connectSocket(() => {
        console.log("Connected to socket")

        socket.getSocket().on('user-joined-room-to-map', (data) => {
            if (data.room != "NONE") {
                console.log(data)
                console.log(`User ${data.user} joined room ${data.room}`)
                map.addUserToRoom(data.user, data.room);
            }
        })

        socket.getSocket().on('user-left-room-to-map', (data) => {
            if (data.room != "NONE") {
                console.log(data);
                console.log(`User ${data.user} left room ${data.room}`);
                map.removeUserFromRoom(data.user, data.room);
            }
        })

        socket.enterMap();
    });

    
})