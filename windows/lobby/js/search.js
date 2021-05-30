const { ipcRenderer } = require('electron');
const rooms = require('../../services/room-service');
const Fuse = require('fuse.js');

function instantSearch() {
    let searchQuery = document.getElementById("search-query").value;
    console.log(searchQuery);
    const searchOptions = {
        keys: ['name'],
        includeMatches: true
    };
    rooms.getRooms({ 'open': '' }, roomList => {
        let fuseObject = new Fuse(roomList, searchOptions);
        let searchResult = fuseObject.search(searchQuery);
    }); 

}

function fullSearch() {
    let searchQuery = document.getElementById("search-query").value;
    console.log(searchQuery);
    ipcRenderer.send('go-to-roommap', 'search', searchQuery);
}

document.getElementById('search-query').addEventListener('input', instantSearch);

document.getElementById('search-btn').addEventListener('click', fullSearch);
document.getElementById('search-query').addEventListener('search', fullSearch);