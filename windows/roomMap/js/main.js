const Fuse = require('fuse.js');
const socket = require('../../services/socket-service');


function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

let urlData = getUrlData();

document.addEventListener('DOMContentLoaded', () => {

    

    const rooms = require('../../services/room-service');
    const users = require('../../services/user-service.js');

    let roomList = [];
    rooms.getRooms({ 'open': '' }, (rooms) => {
        for (let room of rooms) {
            roomList.push(JSON.parse(JSON.stringify(room)));
        }
    });
    var userList = [];
    users.getAllUsers((users) => {
        for (let user of users) {
            userList.push(JSON.parse(JSON.stringify(user)));
        }
    })
    const map = new GlobalMap(
        document.getElementById('map'),
        './assets/map.jpg',
        roomList,
        userList
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

        socket.onUserEnteredRoom((user) => {
            console.log("User joined: ", user)
        })

        socket.enterMap();
    });
    
})