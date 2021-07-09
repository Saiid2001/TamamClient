const { ipcRenderer } = require('electron');
const rooms = require('../../services/room-service');
const Fuse = require('fuse.js');

function embolden(str, indexArray) {
    let strArr = str.split('');
    for (let i = 0; i < indexArray.length; ++i) {
        strArr.splice(indexArray[i][0] + 2 * i, 0, '<b>');
        strArr.splice(indexArray[i][1] + 2 * i + 2, 0, '</b>');
    }
    return strArr.join('');
}

function createDropdown(searchResult, searchQuery) {
    let innerHTML = '';
    let numEntries = searchResult.length < 3 ? searchResult.length : 3;
    for (let i = 0; i < numEntries; ++i) {
        let roomName = embolden(searchResult[i]['item']['name'], searchResult[i]['matches'][0]['indices']);
        innerHTML += `<p id="entry-${i}">${roomName} | 
                     ${searchResult[i]['item']['users'].length}/${searchResult[i]['item']['maxCapacity']}</p>`;
    }
    document.getElementById('search-dropdown').innerHTML = innerHTML;
    for (let i = 0; i < numEntries; ++i) {
        document.getElementById(`entry-${i}`).addEventListener('click', () => {
            ipcRenderer.send('go-to-room', searchResult[i]['item']['_id'], { 'source': 'search', 'extra-params': searchQuery });
        });
    }
}

function instantSearch() {
    let searchQuery = document.getElementById("search-query").value;
    console.log(searchQuery);
    const searchOptions = {
        keys: ['name'],
        includeMatches: true
    };
    rooms.getRooms({ 'open': '' }, (rooms) => {
        let roomList = []
        for (let room of rooms) {
            if (room['mapInfo']['onMap']) {
                roomList.push(room)
            }
        }
        let fuseObject = new Fuse(roomList, searchOptions);
        let searchResult = fuseObject.search(searchQuery);
        let maingateIndex = searchResult.findIndex((entry) => entry['item']['name'] == 'Main Gate');
        if (maingateIndex != -1) searchResult.splice(maingateIndex, 1);
        createDropdown(searchResult, searchQuery);
    }); 

}

function fullSearch() {
    let searchQuery = document.getElementById("search-query").value;
    console.log(searchQuery);
    ipcRenderer.send('go-to-roommap', 'search', searchQuery);
}

document.getElementById('search-query').addEventListener('input', instantSearch);

document.getElementById('search-query').addEventListener('focus', () => {
    document.getElementById('search-dropdown').style.display = "block";
});

let hoveringOnDropdown = false;
document.getElementById('search-dropdown').addEventListener('mouseover', () => {
    hoveringOnDropdown = true;
});
document.getElementById('search-dropdown').addEventListener('mouseout', () => {
    hoveringOnDropdown = false;
});
document.getElementById('search-query').addEventListener('blur', () => {
    if (!hoveringOnDropdown) {
        document.getElementById('search-dropdown').style.display = "none";
    }
});

document.getElementById('search-btn').addEventListener('click', fullSearch);
document.getElementById('search-query').addEventListener('search', fullSearch);