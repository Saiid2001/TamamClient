parent.document.addEventListener('request-call', e => {
    console.log('calling')
})

let localstream = null;
async function playVideoFromCamera() {
    try {
        const constraints = { 'video': true, 'audio': false };
        localstream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('video#test');
        videoElement.srcObject = localstream;

        document.querySelector('button.video').onclick = stopVideoFromCamera
    } catch (error) {
        console.error('Error opening video camera.', error);
    }
    

}

async function stopVideoFromCamera() {
    
    localstream.getTracks().forEach((item, i) => { console.log(item); item.stop()})
    document.querySelector('button.video').onclick = playVideoFromCamera
}

document.querySelector('button.video').onclick = playVideoFromCamera

