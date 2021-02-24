const { getAuthenticationURL } = require('../../services/auth-service')

document.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron')
    document.querySelector('.ms-login').onclick = () => {

        ipcRenderer.send('go-to-ms-login')
    };

})