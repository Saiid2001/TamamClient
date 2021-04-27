document.addEventListener('DOMContentLoaded', () => {

    const rooms = require('../../services/room-service')

    rooms.getRooms({ 'open': '' }, (rooms) => {
        showRooms(document.querySelector('.recommended .cards'), rooms)
    })
})