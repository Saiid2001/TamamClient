document.addEventListener('DOMContentLoaded', () => {
    
    const remote = require('electron').remote; 
    let BrowserWindow = remote.BrowserWindow;


    document.getElementById('min-window').onclick = () => {
            
            //var window = BrowserWindow.getFocusedWindow();
            //window.minimize();
        };
})