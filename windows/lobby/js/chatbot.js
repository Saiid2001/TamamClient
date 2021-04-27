document.addEventListener('user-ready', () => {


    let typingObj = document.createElement('div')
    typingObj.id = "wave"
    typingObj.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
    `;

    function typingStart() {
        const chatArea = document.querySelector('.side-bar .chat')
        chatArea.appendChild(typingObj)
    }

    function typingStop() {
        const chatArea = document.querySelector('.side-bar .chat')
        chatArea.removeChild(typingObj)
    }


    typingStart()
    setTimeout(() => {
        typingStop();
        receiveMessage(
            `Good morning ${User.firstName}!
             What are you up to today ?`
        )
        setTimeout(() => {
            typingStart();
            setTimeout(() => {
                typingStop();
                receiveMessage(
                    `You have CMPS 211 soon!`
                )
                setTimeout(() => {


                    presentChoices()

                }, 500)


            }, 1000)
        }, 500)
    }, 1000)

    

    

})


function receiveMessage(data) {
    const chatArea = document.querySelector('.side-bar .chat')

    let message = document.createElement('div')
    message.className = "message in";
    chatArea.appendChild(message)

    let content = document.createElement('div')
    content.className = "content";
    content.innerHTML = data;
    message.appendChild(content)
}


function presentChoices() {
    const chatArea = document.querySelector('.side-bar .chat')

    let message = document.createElement('div')
    message.className = "message out choices";
    chatArea.appendChild(message)

    let content = document.createElement('div')
    content.className = "content";
    content.innerHTML = `
      <button id='go-study'>I want to Study</button>
      <button id='go-vibe'>I want to vibe with friends</button>
    `;

    const { ipcRenderer } = require('electron')
    content.querySelector('#go-study').onclick = () => {
        socket.exitRoom();
        ipcRenderer.send('go-to','roomMap')
    }
    message.appendChild(content)
}
