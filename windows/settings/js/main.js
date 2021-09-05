const schedule_service = require('../../services/schedule-service')
const user_service = require('../../services/user-service')
const bitmoji_service = require('../../services/bitmoji-service')
const {ipcRenderer} = require('electron')
document.addEventListener('DOMContentLoaded', ()=>{



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
        let r = ipcRenderer.send('go-to-roommap', 'default', {})
    })
    
})