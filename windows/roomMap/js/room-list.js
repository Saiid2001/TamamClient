const { ipcRenderer } = require('electron')


const backgrounds = {
    'BDH': {
        image: './assets/BDH_bg.png'

    },
    'Jaffet Upper': {
        image: './assets/Group 442.png'

    },
    'Jaffet Library': {
        image: './assets/Group 442.png'

    },
    'Main Gate': {
        image: './assets/MainGat_bg.jpg'

    }
}


function showRooms(container, rooms) {

    container.innerHTML = ""
    rooms.forEach((room, i) => {

        
        let box = document.createElement('div')
        box.className = "room";
        box.innerHTML = `<div>
                            <h1><img src="./assets/location_on.png" /> ${room['name']}</h1>
                            <p>${room['users'].length}/${room['maxCapacity']} <img src="./assets/supervisor_account.png" /></p>
                         </div>`;

        box.style.backgroundImage = 'url(\'' + backgrounds[room.name]['image'] + '\')'
        if (room['name'] == "Main Gate") {
            box.onclick = () => {
                let r = ipcRenderer.send('go-to', 'lobby')
            }
        } else {
            box.onclick = () => {
                let r = ipcRenderer.send('go-to-room', room['_id'], urlData)
                // Sends data sent with roommap url to room as query to know to which screen to return
            }
        }
        

        container.appendChild(box)
    })
}


