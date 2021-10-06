
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


function showRooms(cardsContainer, roomList, labelContainer, label) {

    console.log("showing rooms")
    labelContainer.innerHTML = label;
    cardsContainer.innerHTML = "";
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
        cardsContainer.appendChild(box)
    })

    labelContainer.scrollIntoView()

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

function initializeRecommended(urlData) {
    let view = document.querySelector('.view');

    let topbar = document.querySelector(".topbar");
    let topbarButton = document.getElementById("display-topbar");

    let mainSearchContainer = document.querySelector(".default");
    let mainsearchbtn = document.querySelector(".default .search .searchbtn");
    let mainsearchbar = document.querySelector(".default .search input");

    let cardviewContainer = document.querySelector(".cardview");
    let cardviewLabelContainer = document.querySelector(".cardview .label");
    let subsearchbar = document.querySelector(".cardview .search input");
    let subsearchbtn = document.querySelector(".cardview .search img");
    let cardsContainer = document.querySelector(".cards");

    let campusMap = document.getElementById("map");



    function createRoomsOnSearch(searchbar) {
        rooms.getRooms({ 'open': '' }, (rooms) => {
            let label = searchbar.value ? `Search results for "${searchbar.value}"` : "Rooms";
            showRooms(cardsContainer, searchRooms(rooms, searchbar.value), cardviewLabelContainer, label);
        });
    }

    // Initialize event listeners for main search screen

    mainsearchbtn.addEventListener('click', () => {
        mainSearchContainer.style.display = "none";
        cardviewContainer.style.display = "";
        createRoomsOnSearch(mainsearchbar);
    });

    mainsearchbar.addEventListener('search', () => {
        mainSearchContainer.style.display = "none";
        cardviewContainer.style.display = "";
        createRoomsOnSearch(mainsearchbar);
    });

    // Initialize event listeners for card screen

    document.querySelector(".cardview .buildingimg").addEventListener('click', () => {
        cardviewContainer.style.display = "none";
        mainSearchContainer.style.display = "";
    })

    subsearchbtn.addEventListener('click', () => {
        createRoomsOnSearch(subsearchbar);
    });

    subsearchbar.addEventListener('search', () => {
        createRoomsOnSearch(subsearchbar);
    });

    function closeTopbar() {
        topbarButton.classList.add('closed')
        //campusMap.removeEventListener("click", closeTopbar);
        topbarButton.addEventListener("click", openTopbar)
        topbarButton.removeEventListener("click", closeTopbar)
        topbar.scrollIntoView({ behavior: 'smooth' })
    }
    function openTopbar() {
        topbarButton.classList.remove('closed');
        topbarButton.addEventListener("click", closeTopbar)
        topbarButton.removeEventListener("click", openTopbar)
        campusMap.scrollIntoView({ behavior: 'smooth'})
    }


    topbarButton.addEventListener("click", closeTopbar)
    campusMap.scrollIntoView()
    openTopbar()

    let last_known_scroll_position = 0;
    let ticking = false;
    let campus_full_screen = true;

    function onScroll(scroll_pos) {
    // Do something with the scroll position
    if(!campus_full_screen && last_known_scroll_position<=0){ 
        topbarButton.classList.remove('closed');
        topbarButton.addEventListener("click", closeTopbar)
        topbarButton.removeEventListener("click", openTopbar)
        campus_full_screen = true
    }
    else if(campus_full_screen && last_known_scroll_position>0){
        topbarButton.classList.add('closed');
        topbarButton.removeEventListener("click", closeTopbar)
        topbarButton.addEventListener("click", openTopbar)
        campus_full_screen = false
    }

    }

    view.addEventListener('scroll', function(e) {
    last_known_scroll_position = campusMap.getBoundingClientRect().y - view.getBoundingClientRect().y;

    if (!ticking) {
        window.requestAnimationFrame(function() {
        onScroll(last_known_scroll_position);
        ticking = false;
        });

        ticking = true;
    }
    });


    // Display either search view or cards view based on urlData

    rooms.getRooms({ 'open': '' }, (rooms) => {

        if (urlData["source"] == 'recommendation') {

            mainSearchContainer.style.display = "none";
            cardviewContainer.style.display = "block";
            showRooms(cardsContainer, rooms, cardviewLabelContainer, `Recommended Rooms`);

        } else if (urlData["source"] == 'search') {

            mainSearchContainer.style.display = "none";
            cardviewContainer.style.display = "block";
            showRooms(cardsContainer, searchRooms(rooms, urlData['extra-params']), cardviewLabelContainer, `Search results for "${urlData['extra-params']}"`)

        } else {

            cardviewContainer.style.display = "none";
            mainSearchContainer.style.display = "block";

        }
    })

}
