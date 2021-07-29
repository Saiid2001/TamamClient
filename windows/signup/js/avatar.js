let AVATAR_VARIANTS = {
    'face-features':{},
    'body':{},
    'outfit':{}
}


const features = {
    'male':{
        'face-features':[
            ['face_proportion', 'Face Shape'],
            ['skin_tone','Skin Tone'],
            ['hair', 'Hair'],
            ['hair_tone', 'Hair Color'],
            ['pupil_tone', 'Eye Color'],
            ['eye_details', 'Eye Detail'],
            ['eyelash', 'Eyelashes'],
            ['brow', 'Brow'],
            ['nose', 'Nose'],
            ['mouth', 'Mouth'],
            ['ear', 'Ear'],
            ['beard', 'Beard'],
            ['beard_tone', 'Beard Color'],
            ['cheek_details', 'Cheek Detail'],
        ],
        'body':[
            ['body', "Body Type"]
        ],
        'outfit':[
            ['hat', 'Head wear'],
            ['glasses','Eye wear'], 
            ['outfit','Outfit'], 
        ]
    },
    'female':{
        'face-features':[
            ['face_proportion', 'Face Shape'],
            ['skin_tone','Skin Tone'],
            ['hair', 'Hair'],
            ['hair_tone', 'Hair Color'],
            ['pupil_tone', 'Eye Color'],
            ['eye_details', 'Eye Detail'],
            ['eyelash', 'Eyelashes'],
            ['brow', 'Brow'],
            ['nose', 'Nose'],
            ['mouth', 'Mouth'],
            ['ear', 'Ear'],
            ['cheek_details', 'Cheek Detail'],
        ],
        'body':[
            ['body', "Body Type"],
            ['breast', "Upper Body"],
        ],
        'outfit':[
            ['hat', 'Head wear'],
            ['glasses','Eye wear'], 
            ['outfit','Outfit'], 
        ]
    }
}

const sectionTitles = {
    'face-features':"Face Features",
    'body': "Body",
    'outfit': "Style"
}

const posesPerSection = {
    'face-features':"head",
    'body': "body",
    'outfit': 'body'
}

const STYLE = 'cm'
let currSec = ''
const libmoji = require('libmoji')
const  bitmojiService= require('../../services/bitmoji-service')
function initAvatarView(){

    const _traits = libmoji.getTraits(STATE.gender, STYLE)
    const traits = {}
    _traits.forEach(elem =>{traits[elem.key] = elem.options})
    
    for(var key of features[STATE.gender]['face-features']){
        AVATAR_VARIANTS['face-features'][key[0]] = traits[key[0]]
    }

    for(var key of features[STATE.gender]['body']){
        AVATAR_VARIANTS['body'][key[0]] = traits[key[0]]
    }
    for(var key of features[STATE.gender]['outfit']){

        if(key!='outfit'){
        AVATAR_VARIANTS['outfit'][key[0]] = traits[key[0]]
        }
    }

    AVATAR_VARIANTS['outfit']['outfit'] = libmoji.getBrands(STATE.gender)[3].outfits.map(x=>{return {value:x.id}})

    STATE.avatar = {}
    STATE.avatar['body'] = {
        'body':{'value':1}
    }
    STATE.avatar['outfit'] = {
        'glasses':{'value':-1},
        'hat':{'value':-1},
        'outfit':{'value': 1018251}
    }

}

function updateAvatar(data){

    const pose = posesPerSection[currSec]
    const scale = 1
    const gender = STATE.gender == 'male'? 1:2;
    //[["bitstrips",1],['bitmoji',4],["cm",5]];
    const style = 5
    const rotation =0;
    
    
    document.getElementById('avatar').querySelector('img').setAttribute('src',
        bitmojiService.getAvatarImage(STATE.avatar, STATE.gender, pose, scale)
    )
    
}

function goToAvatarSection(section_key){

    currSec = section_key
    var toView = document.getElementById(section_key);
    var parent = toView.parentElement

    parent.querySelector('section:not([hidden])').setAttribute('hidden','')
    toView.removeAttribute('hidden');

    //the sliders
    
    function selectNext(elem){
        let key = elem.id
        let curr = elem.getAttribute('data-i');
        if(!curr) curr=0;

        //curr = (curr+1)%AVATAR_VARIANTS[section_key][key].length;
        curr++;
        if(curr>=AVATAR_VARIANTS[section_key][key].length){
            curr = 0
        }

        elem.setAttribute('data-i', curr);
        STATE.avatar[section_key][key] = AVATAR_VARIANTS[section_key][key][curr]
        updateAvatar(STATE.avatar);
    }
    function selectPrevious(elem){
        let key = elem.id
        let curr = elem.getAttribute('data-i');
        if(!curr) curr=0;

        curr = (AVATAR_VARIANTS[section_key][key].length+curr-1)%AVATAR_VARIANTS[section_key][key].length;

        elem.setAttribute('data-i', curr);
        STATE.avatar[section_key][key] = AVATAR_VARIANTS[section_key][key][curr]
        updateAvatar(STATE.avatar);
    }

    
    if(!(section_key in STATE.avatar)) STATE.avatar[section_key] = {}

    toView.innerHTML = `<div class="section-title">${sectionTitles[section_key]}</div>`;

    for(var keyObj of features[STATE.gender][section_key]){

        var key = keyObj[0]

        let elem = document.createElement('div')
        elem.className='roulette-select'
        elem.id = key
        elem.innerHTML = `
        <button>
                                &lt;
                            </button>
                            <span>
                                ${keyObj[1]}
                            </span>
                            <button>
                                &gt;
                            </button>
        `;

        elem.setAttribute('data-i', 0);

        toView.appendChild(elem)
        
        if(!(key in STATE.avatar[section_key])) STATE.avatar[section_key][key] = AVATAR_VARIANTS[section_key][key][0]
        
        var buttons = elem.querySelectorAll('button')
        buttons[0].onclick = (e)=>{
            selectPrevious(elem)
            e.preventDefault();
        };
        buttons[1].onclick = (e)=>{
            selectNext(elem)
            e.preventDefault();
        };

    }

    updateAvatar();

    //updating send button action
    var sendBtn = document.querySelector('#appearance-card .send-btn')
    var backBtn = document.querySelector('#appearance-card .back-btn')

    var sections = Object.keys(AVATAR_VARIANTS)
    var index = sections.indexOf(section_key)

    if(index<sections.length-1){
        sendBtn.onclick = ()=>{goToAvatarSection(sections[index+1])}
        sendBtn.innerHTML = "Next"
    }else{
        sendBtn.onclick = ()=>{signup()}
        sendBtn.innerHTML = "Signup"
    }

    if(index>0){
        backBtn.onclick = ()=>{goToAvatarSection(sections[index-1])}
        backBtn.removeAttribute('disabled')
    }else{
        backBtn.setAttribute('disabled', '')
    }
}