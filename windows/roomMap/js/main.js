const Fuse = require('fuse.js');
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
            console.log(rooms);
            showRooms(document.querySelector('.recommended .cards'), rooms);

        } else if (urlData['source'] == 'search') { // NEW: Display cards after Fuse search
            console.log(rooms);
            document.getElementById('cards-label').innerHTML = `Results for search: ${urlData['extra-params']}`;
            const searchOptions = {
                keys: ['name'],
            };
            let searchQuery = urlData['extra-params'];
            if (!(searchQuery == '')) {
                let fuseObject = new Fuse(rooms, searchOptions);
                let searchResult = fuseObject.search(searchQuery);
                let searchedRooms = [];
                for (let entry of searchResult) {
                    searchedRooms.push(entry.item);
                }
                if (searchedRooms.find((room) => room.name == "Main Gate") == undefined) {
                    searchedRooms.unshift(rooms.find((room) => room.name == "Main Gate"));
                }
                console.log(searchedRooms);
                showRooms(document.querySelector('.recommended .cards'), searchedRooms);
            } else {
                showRooms(document.querySelector('.recommended .cards'), roomList);
            }
            //map.addRooms(rooms);
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