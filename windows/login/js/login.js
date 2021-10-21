const { getAuthenticationURL } = require('../../services/auth-service')

document.addEventListener('DOMContentLoaded', () => {
    const {ipcRenderer} = require('electron')
    document.querySelector('.ms-login').onclick = () => {

        let server_box = document.querySelector('#dev-server')

        if(server_box.value){
            ipcRenderer.send('go-to-ms-login', {'server':server_box.value})
        }else{
            ipcRenderer.send('go-to-ms-login', {})
        }
    };

})