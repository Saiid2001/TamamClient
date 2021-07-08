const { ipcRenderer } = require('electron');
const socket  = require('../../services/socket-service');

document.addEventListener('DOMContentLoaded', () => {

function getUrlData() { // Taken from room/js/main, should globalize and make it an import later
    const querystring = require('querystring');
    let query = querystring.parse(global.location.search);
    return JSON.parse(query['?data'])
}
    
let urlData = getUrlData();

let participants = urlData['participants']
const chat_id = urlData['id']
const myUser_id = urlData['user']


let chatHistory = {}

let activePeer = chat_id;


const chatThreadView = document.querySelector('.scroll-container');

function loadChats(){

    chatThreadView.innerHTML = ""

    chatHistory[activePeer].forEach(message => showMessage(message));


}

function sendMessage(text){

    if(!(text.length)) return

    //sending the message on the socket
    var message = {
        "text": text,
        "author": myUser_id,
        'time': (new Date()).toLocaleTimeString(),
        'destination': activePeer
    }

    
    ipcRenderer.send('send_message',message)
    onMessageSent(message)

}

function onMessageSent(message){

    chatHistory[activePeer].push(message)
    showMessage(message)

    text_input.value = ''
}

function onMessageReceived(message){

    if(message.destination == myUser_id){
        chatHistory[message.author].push(message)
        if(message.author == activePeer) showMessage(message);
    }else{

        chatHistory[chat_id].push(message)
        if(chat_id == activePeer) showMessage(message);
    }
    console.log(chatHistory)
}

function showMessage(message){

    let isSent = message.author == myUser_id;

    var msg = document.createElement('p')
    msg.className = isSent?'sent': 'recv';

        msg.innerHTML = `${message.text}
                <small>
                    <small>${isSent?'You':participants[message.author].name}</small>
                    <small>${message.time}</small>
                </small>`;

    chatThreadView.appendChild(msg)
    msg.scrollIntoView()
}

function changePeer(peer){
    activePeer = peer;
    loadChats();
}

function loadPeers(){

    
    Object.keys(participants).forEach( participant_id=>{

        var peerOpt = document.createElement('option')
        peerOpt.value = participant_id;
        peerOpt.innerText = participants[participant_id].name;
        peerOpt.id = participant_id;
        peer_select.append(peerOpt)
    
        chatHistory[participant_id] = []


    })
    
}

function addPeer(participant_id, participantData){

    participants[participant_id] = participantData


    var peerOpt = document.createElement('option')
        peerOpt.value = participant_id;
        peerOpt.innerText = participants[participant_id].name;
        peerOpt.id = participant_id;
        peer_select.append(peerOpt)
    
        chatHistory[participant_id] = []

}

function removePeer(peer_id){

    delete chatHistory[peer_id]
    delete participants[peer_id]

    document.getElementById(peer_id).parentElement.removeChild(document.getElementById(peer_id))

    if(activePeer == peer_id) changePeer(chat_id)

}



const send_btn = document.querySelector('footer button')
const text_input = document.querySelector('footer input')
const peer_select = document.querySelector('header select')

send_btn.onclick = ()=>{ sendMessage(text_input.value)}

document.addEventListener('keypress',event=>{
    if(event.key=="Enter"){
        sendMessage(text_input.value)
    }
})

peer_select.onchange = (event)=>{changePeer(peer_select.value)}

addPeer(chat_id, {name:"Everyone"})
loadPeers();
loadChats();



ipcRenderer.on('message_recv', (event,message)=>{onMessageReceived(message)})

ipcRenderer.on('user_added_group', (event,user)=>{addPeer(user.id,user)})
ipcRenderer.on('user_left_group', (event,user_id)=>{removePeer(user_id)})
})

