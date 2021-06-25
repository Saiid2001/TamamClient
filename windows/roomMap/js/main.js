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
    const map = new GlobalMap(
        document.getElementById('map'),
        './assets/map.jpg',
        rooms,
        users
    );


    //socket.connectSocket(() => {
    //    socket.onUserEnteredRoom((user) => {
    //        console.log(user);
    //    });
    //})

    console.log(urlData['source']);
    if (urlData['source'] == 'recommendation') {
        rooms.getRooms({ 'open': '' }, (rooms) => {

            showRooms(document.querySelector('.recommended .cards'), rooms);
            //map.addRooms(rooms);
        })
    } else if (urlData['source'] == 'search') { // NEW: Display cards after Fuse search
        document.getElementById('cards-label').innerHTML = `Results for search: ${urlData['extra-params']}`;
        const searchOptions = {
            keys: ['name'],
        };
        let searchQuery = urlData['extra-params'];
        rooms.getRooms({ 'open': '' }, (rooms) => {
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
                showRooms(document.querySelector('.recommended .cards'), searchedRooms);
            } else {
                showRooms(document.querySelector('.recommended .cards'), rooms);
            }
            //map.addRooms(rooms);
        }); 
    }

    
})