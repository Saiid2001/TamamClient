


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

const libmoji = require('libmoji')

function getAvatarImage(data,_gender, pose='body', scale=1){

    const gender = _gender == 'male'? 1:2;
    //[["bitstrips",1],['bitmoji',4],["cm",5]];
    const style = 5
    const rotation =0;
    
    let outfit = data.outfit.outfit.value
    let traits = []

    if(_gender == 'male'){
    traits = [
            ["beard", data['face-features']['beard'].value], 
            ["brow", data['face-features']['brow'].value], 
            ["cheek_details", data['face-features']['cheek_details'].value], 
            ["eye_details", data['face-features']['eye_details'].value], 
            ["ear", data['face-features']['ear'].value],
            ["eyelash", data['face-features']['eyelash'].value],
            ["face_lines", -1],
            ["glasses", data['outfit']['glasses'].value],
            ["hair", data['face-features']['hair'].value],
            ["hat", data['outfit']['hat'].value],
            ["mouth",  data['face-features']['mouth'].value], 
            ["nose",  data['face-features']['nose'].value],
            ["beard_tone", data['face-features']['beard_tone'].value],
            ["blush_tone", -1],
            ["brow_tone", -1],
            ["eyeshadow_tone", -1],
            ["hair_tone", data['face-features']['hair_tone'].value],
            ["hair_treatment_tone", -1],
            ["lipstick_tone", -1],
            ["pupil_tone",  data['face-features']['pupil_tone'].value],
            ["skin_tone",  data['face-features']['skin_tone'].value],
            ["body", data['body']['body'].value],
            ["face_proportion", data['face-features']['face_proportion'].value],
            ["eye_spacing", 1],
            ["eye_size", 1],
            ["jaw", 1392]
        ];
    }else{

        if(!('breast' in data['body'])){
            data['body']['breast'] = {value:1}
        }

    traits = [
        ["brow", data['face-features']['brow'].value], 
        ["cheek_details", data['face-features']['cheek_details'].value], 
        ["ear", data['face-features']['ear'].value],
        ["eye", 1621],
        ["eyelash", data['face-features']['eyelash'].value],
        ["eye_details", data['face-features']['eye_details'].value], 
        ["face_lines", -1],
        ["glasses", data['outfit']['glasses'].value],
        ["hair", data['face-features']['hair'].value],
        ["hat", data['outfit']['hat'].value],
        ["jaw", 1412],
        ["mouth",  data['face-features']['mouth'].value], 
        ["nose",  data['face-features']['nose'].value],
        ["blush_tone", -1],
        ["brow_tone", -1],
        ["eyeshadow_tone", -1],
        ["hair_tone", data['face-features']['hair_tone'].value],
        ["hair_treatment_tone", -1],
        ["lipstick_tone", -1],
        ["pupil_tone",  data['face-features']['pupil_tone'].value],
        ["skin_tone",  data['face-features']['skin_tone'].value],
        ["body", data['body']['body'].value],
        ["breast", data['body']['breast'].value],
        ["face_proportion", data['face-features']['face_proportion'].value],
        ["eye_spacing", 1],
        ["eye_size", 1]
    ]
    }
    
    return libmoji.buildPreviewUrl(pose,scale,gender,style,rotation,traits,outfit)
    
}


module.exports = {
    getAvatarImage
}