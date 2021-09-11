const schedule_service = require('../../services/schedule-service')
const user_service = require('../../services/user-service')
const bitmoji_service = require('../../services/bitmoji-service')
const { ipcRenderer } = require('electron')

function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

let urlData = getUrlData();

document.addEventListener('DOMContentLoaded', ()=>{

    console.log(urlData);

    function showProfile(user){
        let prfl = document.getElementById('profile-preview')
        let label = prfl.querySelector('h2')
        let img = prfl.querySelector('img')
        label.innerText = user.firstName+" "+user.lastName;
        img.src = bitmoji_service.getAvatarImage(
            user.avatar,
            user.gender,
            'head'
        )
    }

    function buildSchedule(){
        schedule_service.getUserCourses(
            (classes)=>{
                Schedule.buildView(
                    document.getElementById('schedule-view'),
                    classes
                )
                Schedule.fillInputArea(
                    document.querySelector('#schedule-tab .input-area'),
                    classes
                )
            }
        )
    }


    user_service.getUserData(showProfile)

    Schedule.activateInputArea(document.querySelector('#schedule-tab .input-area'), (crns)=>{
        schedule_service.setUserCourses(crns,buildSchedule)
    })

    buildSchedule()

    document.querySelector('#sidebar .back').addEventListener('click', ()=>{
        let r = ipcRenderer.send('go-to', urlData.window, urlData['return-data'])
    })
    
})