


let STATE = {}

const { ipcRenderer } = require('electron');
const $ = require('jquery');
const authService = require('../../services/auth-service')

function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}

let urlData = getUrlData();

function init(){

    let sendBtn = document.querySelector('#personal-info-card .send-btn');

    sendBtn.onclick = sendPersonalInfo

    const email = document.querySelector('#email input');
    email.value = urlData['email']

}

function sendPersonalInfo(){

    //fields
    const firstname = document.querySelector('#firstname input');
    const lastname = document.querySelector('#lastname input');
    const email = document.querySelector('#email input');

    //removing error classes
    document.querySelectorAll('#personal-info-card input.error').forEach(elem=>elem.classList.remove('error'))

    //checking fields
    var validation = checkForm(
        [
            {
            field: firstname,
            validators: ['not_empty']
            },
            {
            field: lastname,
            validators: ['not_empty']
            },
            {
            field: email,
            validators: ['not_empty', 'email']
            },
    ]
    )

    if(!validation.result) {

        var errorField = document.getElementById(validation.source.field).querySelector('input');
        errorField.classList.add('error')
        return;
    }

    STATE.firstname = firstname.value
    STATE.lastname = lastname.value
    STATE.email = email.value

    // sending the form data
    var data = {
        "firstname": firstname.value,
        "lastname": lastname.value,
        "email": email.value
    }

    //ajax call

    authService.sendPersonalInfo(data, onPersonalInfoSent)
    initEmailVerification()
}

function onPersonalInfoSent(data){
    STATE.userId = data['_id']
}

function initEmailVerification(){
    updateLoading(1)
    showCard('email-validation')

    let i ;

    function checkUserStatus(){


        if(!STATE.userId) return; 

        authService.getUserStatus(STATE.userId,
            (status)=>{
                if(status['status'] == 'confirmed'){
                    clearInterval(i);
                    onEmailVerification(true)
                }
            }
            )
    }

    i = setInterval(checkUserStatus, 3000)

    setTimeout(()=>{
        clearInterval(i)
        onEmailVerification(false)
    }, 180000)
}

function onEmailVerification(isVerified ){
    let sendBtn = document.querySelector('#email-validation .send-btn');
    sendBtn.onclick = initAcademicInformation

    if(isVerified && !STATE.isEmailTimeout){
        STATE.isEmailVerified = true;

        document.getElementById('validation-success').removeAttribute('hidden')
        document.getElementById('validation-pending').setAttribute('hidden','')

        sendBtn.removeAttribute('disabled')

    }else if(!STATE.isEmailVerified){
        STATE.isEmailTimeout = true;

        //show error
        document.getElementById('validation-error').removeAttribute('hidden')
        document.getElementById('validation-pending').setAttribute('hidden','')

    }
}


function initAcademicInformation(){
    updateLoading(2)
    showCard('academic-info-card')

    let sendBtn = document.querySelector('#academic-info-card .send-btn');

    sendBtn.onclick = ()=>{
        //validation
        const enrollY = document.querySelector('#enrollment-year input');
        const gradY = document.querySelector('#grad-year input');

        //removing error classes
    document.querySelectorAll('#enrollment-year input.error').forEach(elem=>elem.classList.remove('error'))

    //checking fields
    var validation = checkForm(
        [
            {
            field: enrollY,
            validators: ['not_empty']
            },
            {
            field: gradY,
            validators: ['not_empty']
            }
    ]
    )

    if(!validation.result) {

        var errorField = document.getElementById(validation.source.field).querySelector('input');
        errorField.classList.add('error')
        return;
    }

    //saving the informtation
    STATE.major = document.querySelector('#major select').value;
    STATE.enrollY = enrollY.value
    STATE.gradY = gradY.value

    initAppearanceInformation();

    }
}


function initAppearanceInformation(){
    updateLoading(3)
    showCard('appearance-card')

    const editManually = document.querySelector('#generate-method-section a');
    editManually.onclick= (e)=>{
        e.preventDefault();
        openGenderSection()
    }
}

function openGenderSection(){
    var genMethSec = document.getElementById('generate-method-section')
    var genderSec = document.getElementById('gender')
    var maleBtn = document.getElementById('male-btn')
    var femaleBtn = document.getElementById('female-btn')
    
    genMethSec.setAttribute('hidden','')
    genderSec.removeAttribute('hidden')

    maleBtn.onclick = (e)=>{
        STATE.gender='male'
        openManualEditFace();

        e.preventDefault();

    }
    femaleBtn.onclick = (e)=>{
        STATE.gender='female'
        openManualEditFace();

        e.preventDefault();

    }
}

function openManualEditFace(){

    initAvatarView();
    
    var genderSec = document.getElementById('gender')
    var editManSec = document.getElementById('manual-customize')
    var avatarView = document.getElementById('avatar-view')
    var sendBtn = document.querySelector('#appearance-card .send-btn')
    var backBtn = document.querySelector('#appearance-card .back-btn')
    
    genderSec.setAttribute('hidden','')
    editManSec.removeAttribute('hidden')
    avatarView.removeAttribute('hidden')
    sendBtn.removeAttribute('hidden')
    backBtn.removeAttribute('hidden')
    backBtn.setAttribute('disabled', '')

    sendBtn.onclick = ()=>{goToAvatarSection('body')}

    goToAvatarSection('face-features')
}

function signup(){


    //send the data and signup
    authService.finalizeSignup(
        JSON.stringify({
            '_id': STATE.userId, 
            'data':{
            'major': STATE.major,
            'gender': STATE.gender,
            'avatar': STATE.avatar,
            'enrollY': parseInt(STATE.enrollY),
            'gradY': parseInt(STATE.gradY)
            }
        }),
        onSignup
    )

    //on signup
    function onSignup(){
        updateLoading(4)
        showCard('finished-card')

        document.getElementById('go-campus').onclick = (e)=>{
            // go to the map

            ipcRenderer.send('go-to', 'login')

            e.preventDefault();
        }
    }
    
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    //listeners on email verifications


    document.getElementById('go-campus').onclick = ()=>{
        
    }
    //for testing
    // document.querySelector('#firstname input').value= 'Saiid'
    // document.querySelector('#lastname input').value = "HC"
    // document.querySelector('#email input').value = 'sae55@mail.aub.edu'
    // sendPersonalInfo();
    // onEmailVerification(true);
    // initAcademicInformation();
    // document.querySelector('#major select').value= 'CCE'
    // document.querySelector('#enrollment-year input').value = '2020';
    // document.querySelector('#grad-year input').value = '2030';
    // document.querySelector('#academic-info-card .send-btn').onclick();
    



})