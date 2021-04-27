const { ipcRenderer } = require('electron')

function showRooms(container, rooms) {

    container.innerHTML = ""
    rooms.forEach((room, i) => {

        
        let box = document.createElement('div')
        box.className = "room";
        box.innerHTML = `<div>
                            <h1><img src="./assets/location_on.png" /> ${room['name']}</h1>
                            <p>${room['users'].length}/${room['maxCapacity']} <img src="./assets/supervisor_account.png" /></p>
                         </div>`;


        if (room['name'] == "Main Gate") {
            box.onclick = () => {
                let r = ipcRenderer.send('go-to', 'lobby')
            }
        } else {
            box.onclick = () => {
                let r = ipcRenderer.send('go-to-room', room['_id'])
            }
        }
        

        container.appendChild(box)
    })
}


