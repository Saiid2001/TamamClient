

document.addEventListener('DOMContentLoaded', () => {
    
    const remote = require('electron').remote;
    
    let BrowserWindow = remote.BrowserWindow;


    document.getElementById('min-window').onclick = () => {
            var window = BrowserWindow.getFocusedWindow();
            window.minimize();
    };
    document.getElementById('max-window').onclick = () => {
        var window = BrowserWindow.getFocusedWindow();
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    };
    document.getElementById('close-window').onclick = () => {
        var window = BrowserWindow.getFocusedWindow();
        window.close();
    };
})