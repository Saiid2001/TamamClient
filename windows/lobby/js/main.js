
let canvasController

document.addEventListener('canvasReady', () => {
    console.log('canvasReady')
    const { ipcRenderer } = require('electron')
    
        canvasController = new CanvasController(new Canvas())

        for (var i = 0; i < 40; i++) {
            canvasController.addAvatar({ id: i, avatar: {} })
            console.log('added')
    }


    //event listeners

    //if user is requesting a call
    document.addEventListener('request-call', e => {
        ipcRenderer.send('request-call', e.detail.UID)
    })

    
})
