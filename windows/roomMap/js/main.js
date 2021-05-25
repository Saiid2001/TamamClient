document.addEventListener('DOMContentLoaded', () => {

    const rooms = require('../../services/room-service')
    const map = new GlobalMap(
        document.getElementById('map'),
        './assets/map.svg'
    );
    rooms.getRooms({ 'open': '' }, (rooms) => {
        showRooms(document.querySelector('.recommended .cards'), rooms)
        map.addRooms(rooms)
    })

    
})