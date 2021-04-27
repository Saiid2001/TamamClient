/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const socket = require('../../services/socket-service')
let kurentoUtils = require('kurento-utils')
var participants = {};
var name;



document.addEventListener('connected-to-socket', () => {
	socket.on('message', parsedMessage => {
		console.info('Received message: ' + parsedMessage.id);

		switch (parsedMessage.id) {
			case 'existingParticipants':
				onExistingParticipants(parsedMessage);
				break;
			case 'newParticipantArrived':
				onNewParticipant(parsedMessage);
				break;
			case 'participantLeft':
				onParticipantLeft(parsedMessage);
				break;
			case 'receiveVideoAnswer':
				receiveVideoResponse(parsedMessage);
				break;
			case 'iceCandidate':
				console.log("ICE candidate: ", parsedMessage);
				if (parsedMessage.name == name) return;
				if (!(parsedMessage.name in participants)) { receiveVideo(parsedMessage.name) }
				participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
					if (error) {
						console.error("Error adding candidate: " + error);
						return;
					}
				});
				
				break;
			default:
				console.error('Unrecognized message', parsedMessage);
		}
	});

})

socket.connectSocket(() => {
	console.log('connected to socket')
	document.dispatchEvent(new Event('connected-to-socket'))
})

function register() {
	name = document.getElementById('name').value;
	var room = document.getElementById('roomName').value;

	document.getElementById('room-header').innerText = 'ROOM ' + room;
	document.getElementById('join').style.display = 'none';
	document.getElementById('room').style.display = 'block';

	var message = {
		id: 'joinRoom',
		name: name,
		roomName: room,
	}
	sendMessage(message);
}

function onNewParticipant(request) {
	receiveVideo(request.name);
}

function receiveVideoResponse(result) {
	if (result.name == name) return;
	participants[result.name].rtcPeer.processAnswer(result.sdpAnswer, function (error) {
		if (error) return console.error(error);
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error(error);
		});
	}
}

function onExistingParticipants(msg) {
	console.log('existing', msg.data)
	var constraints = {
		audio: true,
		video: {
			mandatory: {
				maxWidth: 320,
				maxFrameRate: 15,
				minFrameRate: 15
			}
		}
	};
	console.log(name + " registered in room " + room);

	if (!(name in participants)) {
		var participant = new Participant(name);
		participants[name] = participant;
		var video = participant.getVideoElement();

		var options = {
			localVideo: video,
			mediaConstraints: constraints,
			onicecandidate: participant.onIceCandidate.bind(participant)
		}
		participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
			function (error) {
				if (error) {
					return console.error(error);
				}
				this.generateOffer(participant.offerToReceiveVideo.bind(participant));
			});

	}

	msg.data.forEach(receiveVideo);
}

function leaveRoom() {
	sendMessage({
		id: 'leaveRoom'
	});

	for (var key in participants) {
		participants[key].dispose();
		delete participants[key]
	}

	document.getElementById('join').style.display = 'block';
	document.getElementById('room').style.display = 'none';

}

function receiveVideo(sender) {

	if(sender in participants) return
	var participant = new Participant(sender);
	participants[sender] = participant;
	var video = participant.getVideoElement();

	var options = {
		remoteVideo: video,
		onicecandidate: participant.onIceCandidate.bind(participant)
	}

	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
		function (error) {
			if (error) {
				return console.error(error);
			}
			this.generateOffer(participant.offerToReceiveVideo.bind(participant));
		});;

	console.log("requested video from "+sender)
}

function onParticipantLeft(request) {
	console.log('Participant ' + request.name + ' left');
	var participant = participants[request.name];
	participant.dispose();
	delete participants[request.name];
}

function sendMessage(message) {
	socket.sendMessage(message);
}