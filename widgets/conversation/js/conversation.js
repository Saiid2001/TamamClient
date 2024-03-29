
class ConversationInterface {
    constructor(view, preferences = {}) {
        //this.scene = scene
        this.pixi = {
            avatarGroup: new PIXI.Container
            
        }
        this.participants = []
        this.view = view
        this.isOpen = false;

        //constants
        this.mediaConstraints = {
            audio: true,
            video: { width: 1280, height: 720 },
        }

        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
            ],
        }

        this.videoOpen = preferences.video ? preferences.video : true;
        this.audioOpen = preferences.audio ? preferences.audio : true;


        //local view
        this.localVideoComponent = this.view.querySelector('.video_on #local video')
        //this.remoteVideoComponent = this.view.querySelector('.video_on #remote video')


        //controls
        this.audioControlView = this.view.querySelector('.control .voice')
        this.videoControlView = this.view.querySelector('.control .video')
        this.leaveControlButton = this.view.querySelector('.control .leave')
        this.chatControlButton = this.view.querySelector('.control .chat')

        var _this = this
        this.audioControlView.addEventListener('click', () => {
            _this.toggleAudio()
        })
        this.videoControlView.addEventListener('click', () => {
            _this.toggleVideo()
        })

        this.leaveControlButton.addEventListener('click', () =>{
            myRoom.moveUser(myUser)
        })

        this.chatControlButton.addEventListener('click', ()=>{
            _this.openChatWindow()
        })
    }


    __addUserToCall(userId){

        var user = myUser.groupObj.users.find(x=>{return x.id == userId})

        if(user){

        ipcRenderer.send('user_added_group', {
            id: userId,
            name: user.firstName+" "+user.lastName
        })
    }

        if(userId in this.remoteUsers) return;

        var videoComponent = document.createElement('div');
        videoComponent.innerHTML = `<div></div><video autoplay playsinline width="70%" height="50%"  />`;
        videoComponent.className = 'window';
        videoComponent.id = 'remote-'+userId;
        this.view.querySelector('.video_on').appendChild(videoComponent)

        this.remoteUsers[userId] = {
            remoteVideoComponent: videoComponent.querySelector('video'),
            rtcPeerConnection: null,
            remoteStream: null
        }
    }

    openChatWindow(){


        var users = {}
        myUser.groupObj.users.forEach(user=>{
            if(myUser.id != user.id){
            users[user.id] = {
                name: user.firstName+" "+user.lastName
            }
        }
        })

        ipcRenderer.send('open-chat-window', {
            "id": this.room,
            "participants": users,
            "user": myUser.id
            
        })
    }

    closeChatWindow(){

        ipcRenderer.send('close-chat-window')
    }

    __removeUserFromCall(userId){


        ipcRenderer.send('user_left_group', userId)

        if(!(userId in this.remoteUsers)) return;

        try{
        this.remoteUsers[userId].remoteStream.getTracks().forEach((track, i) => {
            try{
            track.stop()
            }catch(e){console.error(e)}
            track.enabled = false;

        })
    }
    catch(e){
        console.error(e)
    }

    

        
        this.view.querySelector('.video_on').removeChild(this.view.querySelector('#remote-'+userId));
        delete this.remoteUsers[userId];
    }
    open(callId, users, isNewComer) {

        var _this=  this;

        callId = roomData._id + "-" + callId
        console.log('call id', callId)

        if (this.isOpen && this.room == callId) return;

        this.participants = []
        users.forEach(user=>{
            if(user.id != myUser.id){
                this.participants.push(user.id)
            }
        })
        this.remoteUsers = {};

        //create the video blocks
        this.participants.forEach( userId =>_this.__addUserToCall(userId));

        this.view.removeAttribute('hidden');

        this.isOpen = true;

        this.isNewComer = isNewComer;

        this._join(callId, isNewComer)

    }

    close() {

        var _this = this;

        this.closeChatWindow();

        console.log('closing conversation interface')
        if (!this.isOpen) return;

        this.view.setAttribute("hidden", "");

        this.isOpen = false;

        try {
            this.localStream.getTracks().forEach((track, i) => {

                try{
                track.stop()
                }catch(e){console.error(e)}
                track.enabled = false;
                
            })

        } catch (e) {
            console.error("could not close tracks ", e)
        }

        try{

            this.participants.forEach(userId=>{
                _this.remoteUsers[userId].remoteStream.getTracks().forEach((track, i) => {
                    try{
                    track.stop()
                    }catch(e){console.error(e)}
                    track.enabled = false;
    
                })
            })
            


        } catch (e) {
            console.error("could not close tracks ", e)
        }
        this.localStream = null

        var videoFeeds  = this.view.querySelectorAll('.video_on .window');
        videoFeeds.forEach((elem,i)=>{
            if(i==0) return;
            elem.parentElement.removeChild(elem);
        })

        this.remoteUsers = null
        this.participants = null
        this.callStarted = false;


    }

    _join(room, isNewComer) {
        console.log('joining call ', room)
        if (room === '') {
            throw 'No call id provided'
        } else {
            this.room = room
            ipcRenderer.send('socketEmit','EnterCall', {roomId: room})
        }
    }
    async _setLocalStream(mediaConstraints) {
        let stream
        try {
            stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
        } catch (error) {
            console.error('Could not get user media', error)
        }
        this.localStream = stream
        this.localVideoComponent.srcObject = stream

        if (!this.videoOpen) { this.toggleVideo() }
        if (!this.audioOpen) { this.toggleAudio() }
    }


    toggleVideo() {
        var _this = this
        try {

            this.localStream.getTracks().forEach(track => {
                if (track.kind == "video") {
                    track.enabled = !track.enabled;
                    _this.videoOpen = !_this.videoOpen;
                    if (track.enabled) {
                        //show control to mute
                        _this.videoControlView.classList.add('on')
                        if (track.readyState == 'ended') {
                            _this._setLocalStream(_this.mediaConstraints)

                            _this.participants.forEach(userId=>{
                                _this.remoteUsers[userId].rtcPeerConnection.addTrack(track, _this.localStream)
                            })
                        }
                        _this.localVideoComponent.parentElement.removeAttribute('hidden')
                        _this.hideAvatar(myUser)

                    } else {
                        // show control to unmute
                        _this.videoControlView.classList.remove('on')
                        //track.stop()

                        _this.localVideoComponent.parentElement.setAttribute('hidden', "")
                        _this.showAvatar(myUser)
                    }

                    ipcRenderer.send('socketEmit', 'track-status-changed', {
                        room: _this.room,
                        status: track.enabled,
                        id: track.id, 
                        user: myUser.id
                    })
                }
            })
        }
        catch { }
    }

    toggleAudio() {

        var _this = this
        try {
            this.localStream.getTracks().forEach(track => {
                if (track.kind == "audio") {
                    track.enabled = !track.enabled;
                    _this.audioOpen = !_this.audioOpen;

                    if (track.enabled) {
                        //show control to mute
                        _this.audioControlView.classList.add('on')
                    } else {
                        // show control to unmute
                        _this.audioControlView.classList.remove('on')
                    }

                    ipcRenderer.send('socketEmit','track-status-changed', {
                        room: _this.room,
                        status: track.enabled,
                        id: track.id,
                        user: myUser.id
                    })

                }
            })
        } catch { }
    }

    toggleRemoteVideo(enabled , user) {
        if (enabled) {

            this.remoteUsers[user.id].remoteVideoComponent.parentElement.removeAttribute('hidden')
            this.hideAvatar(user)
        } else {
            this.remoteUsers[user.id].remoteVideoComponent.parentElement.setAttribute('hidden', "")
            this.showAvatar(user)
        }
    }

    addLocalTracks(rtcPeerConnection) {
        var _this = this
        try {
            this.localStream.getTracks().forEach((track) => {
                rtcPeerConnection.addTrack(track, _this.localStream)
            })
        }
        catch (error) {
            console.error("Could not add local track ",error)
        }
    
    }

    setRemoteStream(event, userId) {



        if (!this.remoteUsers[userId]){
            this.__addUserToCall(userId)
        }
        if ( !this.remoteUsers[userId].remoteStream) {

            this.remoteUsers[userId].remoteStream = new MediaStream()
            var stream = this.remoteUsers[userId].remoteStream
            var video = this.remoteUsers[userId].remoteVideoComponent
            

            //Set video source
            video.srcObject = stream;

            //Play it
            video.autoplay = true;
            video.playsInline = true;
            video.muted = false;
        }

        var existing = this.remoteUsers[userId].remoteStream.getTracks().find(elem => { return elem.kind == event.track.kind })
        if(existing) this.remoteUsers[userId].remoteStream.removeTrack(existing)
        this.remoteUsers[userId].remoteStream.addTrack(event.track, this.remoteUsers[userId].remoteStream)
    }

    sendIceCandidate(event, destinationUser) {
        if (event.candidate)
        {
            var roomId = this.room

            var data = {
                
                    label: event.candidate.sdpMLineIndex,
                    candidate: event.candidate.candidate,
                    room: roomId,
                    user: myUser.id,
                    destination: destinationUser
            
            }
            ipcRenderer.send('socketEmit','webrtc-ice-candidate', data)
        }

    }
    async createAnswer(rtcPeerConnection, destinationUser) {
    var roomId = this.room
    let sessionDescription
    try {
        sessionDescription = await rtcPeerConnection.createAnswer()
        rtcPeerConnection.setLocalDescription(sessionDescription)
    } catch (error) {
        console.error(error)
        }
        ipcRenderer.send('socketEmit','webrtc-answer', {
        type: 'webrtc_answer',
        sdp: {
            sdp: sessionDescription.sdp,
            type: sessionDescription.type
        },
        room: roomId,
        user: myUser.id,
        destination:destinationUser
    })
    console.log("sent answer")
    }

    async createOffer(rtcPeerConnection, destinationUser) {
        console.log('creating offer')
        var _this = this
        var roomId = this.room
    let sessionDescription
    try {
        sessionDescription = await rtcPeerConnection.createOffer()
        rtcPeerConnection.setLocalDescription(sessionDescription)
    } catch (error) {
        console.error(error)
    }

    console.log({
        type: 'webrtc_offer',
        sdp: sessionDescription,
        room: roomId,
        user: myUser.id,
        destination:destinationUser
    })

    ipcRenderer.send('socketEmit','webrtc-offer', {
        type: 'webrtc_offer',
        sdp: {
            sdp:sessionDescription.sdp,
            type: sessionDescription.type
        },
        room: roomId,
        user: myUser.id,
        destination:destinationUser
    })
    }

    showAvatar(user) {
        //var avatar = user.avatar.getFullBody(false);
        //avatar.user = user.id;
        //this.pixi.avatarGroup.addChild(avatar);
        //this.view.querySelector('.participants img').removeAttribute('hidden')
        console.log('showing avatar for ', user)
        var container = this.view.querySelector('.participants')

        var elem= container.querySelector("#avatar-"+user.id);

        if(!(elem)){
            elem = document.createElement('img')
            elem.id = 'avatar-'+user.id
            elem.setAttribute('src','../../assets/img/avatars_gen1/'+Avatar.VARIANTS[user.avatar.data.index])
            container.appendChild(elem)
        }

        elem.removeAttribute('hidden')
    }
    hideAvatar(user) {
        //this.view.querySelector('.participants img').setAttribute('hidden','')
        var container = this.view.querySelector('.participants')

        var elem= container.querySelector("#avatar-"+user.id);

        if(elem){
            elem.setAttribute('hidden', '')
        }
    }

    showMessagePopup(message){
        var videoObj = this.remoteUsers[message.author].remoteVideoComponent;
        var windowObj = videoObj.parentElement;

        var chatGroup = windowObj.querySelector('div');
        
        var chatPopup = document.createElement('p');
        chatPopup.innerText  = message.text;

        chatGroup.appendChild(chatPopup)

        setTimeout(()=>{
            chatGroup.removeChild(chatPopup)
        }, 10000)
    }
}


let myConversationInterface = new ConversationInterface(document.getElementById('call'))


document.addEventListener("connected-to-socket", async => {
    
    ipcRenderer.on('call-room-created', async () => {
        console.log('Socket event callback: room_created')

        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)
        myConversationInterface.isRoomCreator = true
    })

    ipcRenderer.send('socketListener', 'call-room-created')


    ipcRenderer.on('call-room-joined', async () => {
        console.log('Socket event callback: room_joined')

        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)
        ipcRenderer.send('socketEmit','start-call', { room: myConversationInterface.room, user: myUser.id })
    })

    ipcRenderer.send('socketListener', 'call-room-joined')

    ipcRenderer.on('start-call', async (e, event) => {

        if(myConversationInterface.callStarted) 
        {
            //if already call started then just add the user

            return;
        }
        
        myConversationInterface.callStarted = true;

        console.log('Socket event callback: start_call')
        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)

        if (myConversationInterface.isNewComer) {

        myConversationInterface.participants.forEach(userId=>{
            myConversationInterface.remoteUsers[userId].rtcPeerConnection= new RTCPeerConnection(myConversationInterface.iceServers)
        
            var rtcPeerConnection = myConversationInterface.remoteUsers[userId].rtcPeerConnection
            rtcPeerConnection._debug = console.log
    
            let negotiating = false;
            rtcPeerConnection.onnegotiationneeded = async e => {
                try {
                    if (negotiating || rtcPeerConnection.signalingState != "stable") return;
                    negotiating = true;
                    await myConversationInterface.createOffer(rtcPeerConnection, userId)
                } finally {
                    negotiating = false;
                }
            }
            
            myConversationInterface.addLocalTracks(rtcPeerConnection)
            rtcPeerConnection.ontrack = event => { console.log(event);myConversationInterface.setRemoteStream(event, userId) }
            rtcPeerConnection.onicecandidate = event => { myConversationInterface.sendIceCandidate(event, userId) }
    
            myConversationInterface.isNewComer = false;
        
        })

        
          
        }
    })

    ipcRenderer.send('socketListener', 'start-call')

    ipcRenderer.on('webrtc-offer', async (e, event) => {


        if(event.user == myUser.id) return;
        if(event.destination != myUser.id) return;

        var userId = event.user;

        console.log('Socket event callback: webrtc_offer')

        if (!myConversationInterface.isNewComer) {

            if(!(userId in myConversationInterface.remoteUsers)){
                myConversationInterface.__addUserToCall(userId)
            }

            myConversationInterface.remoteUsers[userId].rtcPeerConnection = new RTCPeerConnection(myConversationInterface.iceServers)
            var rtcPeerConnection = myConversationInterface.remoteUsers[userId].rtcPeerConnection
            let negotiating = false;
                
            myConversationInterface.addLocalTracks(rtcPeerConnection)
            rtcPeerConnection.ontrack = event => { myConversationInterface.setRemoteStream(event, userId) }
            rtcPeerConnection.onicecandidate = event => { myConversationInterface.sendIceCandidate(event, userId) }
            rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
    
            await myConversationInterface.createAnswer(rtcPeerConnection, userId)
            
        }
    })

    ipcRenderer.send('socketListener', 'webrtc-offer')

    ipcRenderer.on('webrtc-answer', async (e, event) => {

        if(event.user == myUser.id) return;
        if(event.destination!= myUser.id) return;

        console.log('Socket event callback: webrtc_answer')

        await myConversationInterface.remoteUsers[event.user].rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
    })

    ipcRenderer.send('socketListener', 'webrtc-answer')

    ipcRenderer.on('webrtc-ice-candidate', (e, event) => {

        if(event.user == myUser.id) return;
        if(event.destination != myUser.id) return;

        console.log('Socket event callback: webrtc_ice_candidate')

        // ICE candidate configuration.
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: event.label,
            candidate: event.candidate,
        })

        console.log(candidate)
        myConversationInterface.remoteUsers[event.user].rtcPeerConnection.addIceCandidate(candidate).catch(error => {console.log(candidate); console.log(error)});
        
    })

    ipcRenderer.send('socketListener', 'webrtc-ice-candidate')

    ipcRenderer.on('track-status-changed', (e, event) => {

        try{
        var track = myConversationInterface.remoteUsers[event.user].remoteStream.getTrackById(event.id)
        track.enabled = event.status
        console.log('remote track changed', event)
        if (track.kind == "video") {

            myConversationInterface.toggleRemoteVideo(track.enabled, myRoom.findUser(event.user))
            
        }
    }
    catch(e){
        console.error(e)
    }
    })

    ipcRenderer.send('socketListener', 'track-status-changed')

    ipcRenderer.on('send_message', (event, message)=>{
        ipcRenderer.send('socketEmit', 'chat-send-message', message)
    })

    ipcRenderer.on('chat-message-recv', (e,event)=>{
        myConversationInterface.showMessagePopup(event)
        ipcRenderer.send('message_recv', event)
    })

    ipcRenderer.send('socketListener', 'chat-message-recv')

})

