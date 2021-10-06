


let mapButton = document.getElementById('map');
    mapButton.addEventListener('click', () => {
        ipcRenderer.send('go-to', 'roomMap', { source: 'default', 'extra-params': '' });
    });

let schedButton = document.getElementById('schedule')
    schedButton.addEventListener('click', ()=>{
        ipcRenderer.send('go-to', 'settings', { window: 'lobby', 'return-data': urlData } )
    })



