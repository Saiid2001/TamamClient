
const { logout } = require('../../services/auth-service')
const { getUserData, getInteractionRecommendations, getGroupRecommendations, getFriendRecommendations } = require('../../services/user-service')
const rooms = require('../../services/room-service')
const bitmoji_service = require('../../services/bitmoji-service')
const electron = require('electron')
const $ = require('jquery');
const { getUpcomingEvents } = require('../../services/schedule-service');

const THUMBNAILS = {
    'bdh': {
        image: 'BDH_bg.png'

    },
    'jaffet_upper': {
        image: 'Jaffet_bg.png'

    },
    'jaffet_library': {
        image: 'Jaffet_bg.png'

    },
    'default': {
        image: 'MainGat_bg.jpg'

    }
}

let roomData = null;
let myRoom;
let urlData;

function getUrlData() {
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

function fillCatchupSection(users){

    let container = document.querySelector('.catchup .user-list')
    container.innerHTML = ""

    for(var user of users){

        console.log(user)

        if(user.onlineStatus == "online" && user.room != "NONE")
        {
        let template = `
        <div class='avatar'><img class="logo" src="${bitmoji_service.getAvatarImage(
            user.avatar,
            user.gender,
            'head'
        )}" /></div>
        <div>${user.firstName}</div>
        `;

        if(user.room != 'NONE')
            template += `<span class="tooltiptext">${user.room}</span>`;

        let obj = document.createElement('div')
        obj.className = 'user tooltip';
        obj.innerHTML = template;

        container.appendChild(obj);

        }


    }

}

function fillActivitySection(activities){
    
    let container = document.querySelector('.side-bar .activity .thread')

    let today = []
    let tomorrow = []
    let nextWeek = []

    let now_date = new Date();

    for(var activity of activities){

        let act_date = new Date(activity['date'])

        let days_passed = Math.ceil((act_date - now_date)/3600000/24)

        console.log(now_date.getDay())
        
        if(days_passed == 0){
            today.push(activity)
        }
        
        else if(days_passed == 1){
            tomorrow.push(activity)
        }

        else if(now_date.getDay()==6 || now_date.getDay()==0){
            nextWeek.push(activity)
        }
    }

    function fillSection(title, activities){
        if(activities.length){

            let title_obj = document.createElement('h3')
            title_obj.innerHTML = title
            console.log(activities)
            container.appendChild(title_obj)

            for(let activity of activities){
                
                let obj = document.createElement('div')
                obj.className= 'event'

                
                obj.innerHTML =   `
                    <h4>${activity.course.SUBJECT} ${activity.course.CODE}</h4>
                    <small class='time'>${(new Date(activity.date)).toLocaleString()}</small>
                    <small class='location'>${activity.is_online?"<a href = '"+activity.location+"'> Meeting Link</a>": activity.location}</small>
                `;

                obj.addEventListener('click', ()=>{
                    ipcRenderer.send('go-to', 'settings', { window: 'lobby', 'return-data': urlData, course: activity.course} )
                })

                container.appendChild(obj)

                obj.querySelectorAll('.location a').forEach(elem=>{
                    elem.addEventListener('click', e=>{
                        e.preventDefault();
                        electron.shell.openExternal(elem.getAttribute('href'))
                        
                    })
                })

            }

        }
    }

    fillSection('Today', today)
    fillSection('Tomorrow', tomorrow)
    fillSection('Next Week', nextWeek)
}

function fillRoomRecommendationSection(rooms){

    

    let container = document.querySelector('.lobby .sections .room-recommendation')

    let room_objects = container.children

    for (let i = 0; i < rooms.length; i++) {
        let title = room_objects[i].querySelector('h1')
        let count = room_objects[i].querySelector('small')
        
        title.innerHTML = rooms[i]['name']
        count.innerHTML = rooms[i]['users'].length? rooms[i]['users'].length + " people": "Empty"

        room_objects[i].querySelector('img').src = "../roomMap/assets/"+THUMBNAILS[rooms[i].thumbnail.id].image

        room_objects[i].addEventListener('click', ()=>{
            ipcRenderer.send('go-to', 'room', { room: rooms[i]['_id'], 'return-data': urlData } )
        })
    }

    container.querySelector('#to-map-entry').addEventListener('click', ()=>{
        ipcRenderer.send('go-to', 'roomMap', {  'return-data': urlData } )
    })
}

function createUserObj(user, isFullBody){
    let obj = document.createElement('div')
    obj.className='person'
    obj.innerHTML = `
    <img src="${bitmoji_service.getAvatarImage(user.avatar, user.gender,isFullBody?'body':'head')}" alt="">
    <small>${user.firstName}</small>
    `;

    return obj
}

function fillGroupRecommendationSection(groups){

    let container = document.querySelector('.lobby .sections .group-recommendation')

    let group_object1 = container.querySelector('.large-group')
    let group_object2 = container.querySelector('.small-groups').children[0]
    let group_object3 = container.querySelector('.small-groups').children[1]

    let room_objects = [group_object1, group_object2, group_object3]
    
    function addUserSmall(user){

    }
    

    for (let i = 0; i < groups.length; i++) {
        let title = room_objects[i].querySelector('h1')
        let room_name = room_objects[i].querySelector('h2')
        let people_container = room_objects[i].querySelector('.people')

        
        switch (groups[i].type) {
            case 'friends':
                
                title.innerHTML = "Join your friends in"
                rooms.getRooms({'_id': groups[i].room}, (rooms)=>{
                    room_name.innerHTML = rooms[0].name
                    if(i == 0)
                        room_objects[i].querySelector('img').src = "../roomMap/assets/"+THUMBNAILS[rooms[0].thumbnail.id].image
        
                })

                break;
            case 'section':

                title.innerHTML = "Study "+group[i].name+ " in"
                rooms.getRooms({'_id': groups[i].room}, (rooms)=>{
                    room_name.innerHTML = rooms[0].name
                    if(i == 0)
                        room_objects[i].querySelector('.bg').src = "../roomMap/assets/"+THUMBNAILS[rooms[0].thumbnail.id].image
        
                })

                break;
            case 'course':

                title.innerHTML = "Study "+group[i].name+ " in"
                rooms.getRooms({'_id': groups[i].room}, (rooms)=>{
                    room_name.innerHTML = rooms[0].name
                    if(i == 0)
                        room_objects[i].querySelector('img').src = "../roomMap/assets/"+THUMBNAILS[rooms[0].thumbnail.id].image
        
                })

                break;
            case 'filler':

                
                rooms.getRooms({'_id': groups[i].room}, (rooms)=>{
                    
                    if(rooms[0].type=='social'){
                        title.innerHTML = "Join the fun in"
                    }else{
                        title.innerHTML = "Study in"
                    }
                    room_name.innerHTML = rooms[0].name
                    if(i == 0)
                        room_objects[i].querySelector('img').src = "../roomMap/assets/"+THUMBNAILS[rooms[0].thumbnail.id].image
        
                })

                break;
            default:
                break;
        }

        
        room_objects[i].addEventListener('click', ()=>{
            ipcRenderer.send('go-to', 'room', { room: groups[i]['room'], 'return-data': urlData } )
        })

        people_container.innerHTML = ""
        groups[i].users.forEach((user,j)=>{

            if(j<=4)
                people_container.appendChild(createUserObj(user, i == 0))
        })
    }

    // container.querySelector('#to-map-entry').addEventListener('click', ()=>{
    //     ipcRenderer.send('go-to', 'roomMap', {  'return-data': urlData } )
    // })

}

function fillFriendRecommendationSection(friends){
    let container = document.querySelector('.lobby .sections .friend-recommendation')
    container.innerHTML = ""
    friends.forEach(({user,from})=>{
        let usrObj = createUserObj(user, true);
        usrObj.classList.add('card')

        usrObj.innerHTML = usrObj.innerHTML+`<h1>${from}</h1>`;

        container.append(usrObj)
    })
}

document.addEventListener('DOMContentLoaded', () => {

    urlData = getUrlData();

    getUserData(myUserData => {
    
    const { ipcRenderer } = require('electron')

    rooms.getRooms({ 'name': "Main Gate" }, (rooms) => {
        roomData = rooms[0]
        onRoom(rooms[0]['_id'], rooms[0]['layout'])
    })

    function onRoom(roomId, roomConf) {
        console.log('got room')
        
        ipcRenderer.on('socketConnection', () => {
            
            console.log('connected to socket')

            ipcRenderer.on('EnterRoom', (event, users) => {
                
                // actions to happen when user enters the room

            });

            ipcRenderer.send('socketEmit', 'EnterRoom', {"roomId": roomId})

            document.dispatchEvent(new Event('connected-to-socket'))
        })

        ipcRenderer.send('socketConnection');

        $("#profile-preview h2").html(myUserData.firstName+" "+myUserData.lastName)
        document.querySelector('#profile-preview img').src = bitmoji_service.getAvatarImage(
            myUserData.avatar,
            myUserData.gender,
            'head'
        )
        document.querySelector('#profile-preview').addEventListener('click', ()=>{
                //ipcRenderer.send('go-to-roommap',urlData.source, urlData['extra-params'] )
            ipcRenderer.send('go-to', 'settings', { window: 'lobby', 'return-data': urlData } )
        })

        $('#friends-bar-widget').load('../../widgets/friends_bar/friends_bar.html', () => {
            friendsBar.init();
        });

        }

        getInteractionRecommendations(fillCatchupSection)
        getUpcomingEvents(fillActivitySection)
        getGroupRecommendations(fillGroupRecommendationSection)
        getFriendRecommendations(fillFriendRecommendationSection)

        rooms.getRoomRecommendation(fillRoomRecommendationSection)


    })

})


