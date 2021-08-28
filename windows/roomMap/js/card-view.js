const {getFriends} = require('../../services/user-service')

var roomPreview = document.querySelector('.room-card-overlay')

roomPreview.addEventListener('click', (event)=>{

    if(event.pageY<roomPreview.getBoundingClientRect().height*0.6){
        closeRoomPreview();
    }
})

function openRoomPreview(room){
    
    var title = roomPreview.querySelector('h1')
    title.innerHTML = room['name']

    if(room['type'] == 'study'){
        roomPreview.querySelector('.attributes .attribute-study').removeAttribute('hidden')
        roomPreview.querySelector('.attributes .attribute-social').setAttribute('hidden','')
    }else{
        roomPreview.querySelector('.attributes .attribute-social').removeAttribute('hidden')
        roomPreview.querySelector('.attributes .attribute-study').setAttribute('hidden','')
    }


    var friendContainer = roomPreview.querySelector('.people .friends')
    friendContainer.innerHTML = ""
    getFriends(friends=>{
        friends.forEach(friend=>{
            elem = document.createElement('img')
            elem.id = 'avatar-' + friend.id
            let avatar = new Avatar(friend.id, friend);
            elem.setAttribute('src', avatar.getBodyUrl());
            elem.style.width = '30%';
            elem.style["margin-left"] = "-7%"
            elem.style.height = 'auto';
            friendContainer.appendChild(elem)
        })
    }, room['_id'])
    

    var img = roomPreview.querySelector('.thumbnail img')

    img.src = THUMBNAILS[room['thumbnail']['id']].image
    var goBtn = roomPreview.querySelector('button')

    goBtn.onclick = ()=>{
        let r = ipcRenderer.send('go-to-room', room['_id'], urlData)
    }

    roomPreview.classList.add('visible')
}

function closeRoomPreview(){
    roomPreview.classList.remove('visible')
}