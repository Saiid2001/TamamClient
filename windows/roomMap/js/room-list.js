const { ipcRenderer } = require('electron')
const Fuse = require('fuse.js');

const THUMBNAILS = {
    'bdh': {
        image: './assets/BDH_bg.png'

    },
    'jaffet_upper': {
        image: './assets/Jaffet_bg.png'

    },
    'jaffet_library': {
        image: './assets/Jaffet_bg.png'

    },
    'default': {
        image: './assets/MainGat_bg.jpg'

    }
}


function showRooms(container, roomList, label) {

    container.innerHTML = `<div class="cardview">
                                <img class="buildingimg" src="./assets/building_icon.svg" />
                                <h1 class="label">${label}</h1>
                                <div class="search">
                                    <img src="../../assets/img/search.svg" />
                                    <input type="search" name="rooms" placeholder="Find rooms or people on campus" />
                                </div>
                                <div class="cards"></div>
                           </div>`;
    let cards = document.querySelector(".cardview .cards");
    roomList.forEach((room, i) => {

        
        let box = document.createElement('div')
        box.className = "room";
        box.innerHTML = `<div>
                            <h1><img src="./assets/location_on.png" /> ${room['name']}</h1>
                            <p>${room['users'].length}/${room['maxCapacity']} <img src="./assets/supervisor_account.png" /></p>
                         </div>`;

        box.style.backgroundImage = 'linear-gradient(180deg, rgba(0, 255, 210, 0.24) 0%, rgba(0, 163, 255, 0.98) 100%), url(\'' + THUMBNAILS['thumbnail' in room? room['thumbnail']['id'] : 'default'].image + '\')'
        if (room['name'] == "Main Gate") {
            box.onclick = () => {
                let r = ipcRenderer.send('go-to', 'lobby')
            }
        } else {
            box.onclick = () => {

                openRoomPreview(room);

            }
        }
        

        cards.appendChild(box)
    })

    document.querySelector(".cardview .buildingimg").addEventListener('click', () => {
        showSearch(container);
    })

    let searchbar = document.querySelector(".cardview .search input");
    let searchbtn = document.querySelector(".cardview .search img");

    searchbtn.addEventListener('click', () => {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            showRooms(container, searchRooms(rooms, searchbar.value), `Search results for "${searchbar.value}"`);
        });
    });

    searchbar.addEventListener('search', () => {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            showRooms(container, searchRooms(rooms, searchbar.value), `Search results for "${searchbar.value}"`);
        });
    });
}

function showSearch(container) {
    container.innerHTML = 
    `<div class="default">
        <img class="buildingimg" src="./assets/building_icon.svg" />
        <h1>ROOM MAP</h1>
        <div class="search">
            <img class="searchbtn" src="../../assets/img/search.svg" />
            <input type="search" name="rooms" placeholder="Find rooms or people on campus" />
            <div class="search-dropdown"></div>
        </div>
    </div>`;

    let searchbtn = document.querySelector(".default .search .searchbtn");
    let searchbar = document.querySelector(".default .search input");
    
    searchbtn.addEventListener('click', () => {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            showRooms(container, searchRooms(rooms, searchbar.value), `Search results for "${searchbar.value}"`);
        });
    });

    searchbar.addEventListener('search', () => {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            showRooms(container, searchRooms(rooms, searchbar.value), `Search results for "${searchbar.value}"`);
        });
    });

}

function searchRooms(rooms, searchQuery) {
    const searchOptions = {
        keys: ['name'],
    };
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
        return searchedRooms;
    } else {
        return rooms;
    }

}
