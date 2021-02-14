

document.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron')
    document.querySelector('.ms-login').onclick = () => {
        window.location.href = ipcRenderer.sendSync('goTo', 'lobby')
    };

})