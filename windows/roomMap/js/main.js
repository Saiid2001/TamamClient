const Fuse = require('fuse.js');

function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

let urlData = getUrlData();

document.addEventListener('DOMContentLoaded', () => {

    const rooms = require('../../services/room-service')
    const map = new GlobalMap(
        document.getElementById('map'),
        './assets/map.svg'
    );
    console.log(urlData['source']);

    if (urlData['source'] == 'recommendation') {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            showRooms(document.querySelector('.recommended .cards'), rooms);
            map.addRooms(rooms);
        })
    } else if (urlData['source'] == 'search') { // NEW: Display cards after Fuse search
        document.getElementById('cards-label').innerHTML = "Search results";
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
            map.addRooms(rooms);
        }); 
    }

    
})