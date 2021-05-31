class ConversationInterface {
    constructor(view, preferences = {}) {
        //this.scene = scene
        this.pixi = {
            avatarGroup : new PIXI.Container
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
        this.remoteVideoComponent = this.view.querySelector('.video_on #remote video')


        //controls
        this.audioControlView = this.view.querySelector('.control .voice')
        this.videoControlView = this.view.querySelector('.control .video')

        var _this = this
        this.audioControlView.addEventListener('click', () => {
            _this.toggleAudio()
        })
        this.videoControlView.addEventListener('click', () => {
            _this.toggleVideo()
        })
    }

    open(callId, users) {

        callId = roomData._id + "-" + callId
        console.log('call id', callId)

        if (this.isOpen && this.room == callId) return;

        this.participants = users;
        this.view.removeAttribute('hidden');

        this.isOpen = true;

        this._join(callId)
        
    }

    close() {
        console.log('closing conversation interface')
        if (!this.isOpen) return; 

        this.view.setAttribute("hidden", "");

        this.isOpen = false;

        try {
            this.localStream.getTracks().forEach((track, i) => {
                track.stop()
                track.enabled = false;
            })
            this.remoteStream.getTracks().forEach((track, i) => {
                track.stop()
                track.enabled = false;

            })
            

        } catch (e) {
            console.error("could not close tracks ",e)
        }
        this.localStream = null
        this.remoteStream = null

        
    }

    _join(room) {
        console.log('joining call ', room)
        if (room === '') {
            throw 'No call id provided'
        } else {
            this.room = room
            socket.enterCall(room)
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

        if (!this.videoOpen) { this.toggleVideo()}
        if (!this.audioOpen) {this.toggleAudio()}
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
                            _this.rtcPeerConnection.addTrack(track, _this.localStream)
                        }
                        _this.localVideoComponent.parentElement.removeAttribute('hidden')

                        
                    } else {
                        // show control to unmute
                        _this.videoControlView.classList.remove('on')
                        //track.stop()
                        
                        _this.localVideoComponent.parentElement.setAttribute('hidden', "")

                    }

                    socket.getSocket().emit('track-status-changed', {
                        room: _this.room,
                        status: track.enabled,
                        id: track.id
                    })
                }
            })
        }
        catch {}
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

                    socket.getSocket().emit('track-status-changed', {
                        room: _this.room,
                        status: track.enabled,
                        id: track.id
                    })

                }
            })
        } catch {}
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

    setRemoteStream(event) {


        if (!this.remoteStream) {

            this.remoteStream = new MediaStream()
            var stream = this.remoteStream
            var video = this.remoteVideoComponent
            

            //Set video source
            video.srcObject = stream;

            //Play it
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
        }

        var existing = this.remoteStream.getTracks().find(elem => { return elem.kind == event.track.kind })
        if(existing) this.remoteStream.removeTrack(existing)
        this.remoteStream.addTrack(event.track, this.remoteStream)
    }

    sendIceCandidate(event) {
        if (event.candidate)
        {
            var roomId = this.room

            var data = {
                
                    label: event.candidate.sdpMLineIndex,
                    candidate: event.candidate.candidate,
                    room: roomId,
            
            }
        socket.getSocket().emit('webrtc-ice-candidate', data)
        }

    }
    async createAnswer(rtcPeerConnection) {
    var roomId = this.room
    let sessionDescription
    try {
        sessionDescription = await rtcPeerConnection.createAnswer()
        rtcPeerConnection.setLocalDescription(sessionDescription)
    } catch (error) {
        console.error(error)
        }
    socket.getSocket().emit('webrtc-answer', {
        type: 'webrtc_answer',
        sdp: sessionDescription,
        room: roomId,
    })
    console.log("sent answer")
    }

    async createOffer(rtcPeerConnection) {
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

    socket.getSocket().emit('webrtc-offer', {
        type: 'webrtc_offer',
        sdp: sessionDescription,
        room: roomId,
    })
}
}


let myConversationInterface = new ConversationInterface(document.getElementById('call'))


document.addEventListener("connected-to-socket", async => {
    
    socket.getSocket().on('call-room-created', async () => {
        console.log('Socket event callback: room_created')

        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)
        myConversationInterface.isRoomCreator = true
    })

    socket.getSocket().on('call-room-joined', async () => {
        console.log('Socket event callback: room_joined')

        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)
        socket.getSocket().emit('start-call', { room: myConversationInterface.room })
    })

    socket.getSocket().on('start-call', async () => {
        console.log('Socket event callback: start_call')
        await myConversationInterface._setLocalStream(myConversationInterface.mediaConstraints)
        console.log(JSON.stringify(myConversationInterface.localStream))
        //if (myConversationInterface.isRoomCreator) {
        myConversationInterface.rtcPeerConnection = new RTCPeerConnection(myConversationInterface.iceServers)
        var rtcPeerConnection = myConversationInterface.rtcPeerConnection 

        let negotiating = false;
        rtcPeerConnection.onnegotiationneeded = async e => {
            try {
                if (negotiating || rtcPeerConnection.signalingState != "stable") return;
                negotiating = true;
                await myConversationInterface.createOffer(myConversationInterface.rtcPeerConnection)
            } finally {
                negotiating = false;
            }
        }
        
        myConversationInterface.addLocalTracks(myConversationInterface.rtcPeerConnection)
        rtcPeerConnection.ontrack = event => { console.log(event);myConversationInterface.setRemoteStream(event) }
        rtcPeerConnection.onicecandidate = event => { myConversationInterface.sendIceCandidate(event) }
          
        //}
    })

    socket.on('webrtc-offer', async (event) => {
        console.log('Socket event callback: webrtc_offer')

        if (!myConversationInterface.isRoomCreator) {

            
            myConversationInterface.rtcPeerConnection = new RTCPeerConnection(myConversationInterface.iceServers)
            var rtcPeerConnection = myConversationInterface.rtcPeerConnection
            let negotiating = false;
            myConversationInterface.addLocalTracks(myConversationInterface.rtcPeerConnection)
            rtcPeerConnection.ontrack = event => { myConversationInterface.setRemoteStream(event) }
            rtcPeerConnection.onicecandidate = event => { myConversationInterface.sendIceCandidate(event) }
            rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))

            //rtcPeerConnection.onnegotiationneeded = async e => {
            //    try {
            //        console.log('in offer', 'peer status', rtcPeerConnection.signalingState)
            //        if (negotiating || rtcPeerConnection.signalingState != "stable") return;
            //        negotiating = true;
            //        await myConversationInterface.createAnswer(rtcPeerConnection)
            //    } finally {
            //        negotiating = false;
            //    }
            //}
            await myConversationInterface.createAnswer(rtcPeerConnection)
            

        }
    })

    socket.on('webrtc-answer', (event) => {
        console.log('Socket event callback: webrtc_answer')

        myConversationInterface.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event.sdp))
    })

    socket.on('webrtc-ice-candidate', (event) => {
        console.log('Socket event callback: webrtc_ice_candidate')

        // ICE candidate configuration.
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: event.label,
            candidate: event.candidate,
        })
        myConversationInterface.rtcPeerConnection.addIceCandidate(candidate)
        
    })

    socket.on('track-status-changed', (event) => {
        var track = myConversationInterface.remoteStream.getTrackById(event.id)
        track.enabled = event.status
        console.log('remote track changed', event)
        if (track.kind == "video") {
            if (track.enabled) {
                myConversationInterface.remoteVideoComponent.parentElement.removeAttribute('hidden')
            } else {
                myConversationInterface.remoteVideoComponent.parentElement.setAttribute('hidden', "")
            }
        }
    })

})

