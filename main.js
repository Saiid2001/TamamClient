'use strict';

const rootPath = require('electron-root-path').rootPath;
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const fs = require('fs')
const authService = require('./services/auth-service');
const aspect = require('electron-aspectratio')
const { session } = require('electron');
const { getAccessToken } = require('./services/auth-service');

var chatWindowOpen = false;

//setting the available pages to load
let pages = {
    'login': {
        'path': 'windows/login/login.html',
        'required':[]
    },
    'lobby': {
        'path': 'windows/lobby/lobby.html',
        'required':[]
    },
    'roomMap': {
        'path': 'windows/roomMap/roomMap.html',
        'required': ['source', 'extra-params']
    },
    'convo': {
        'path': 'windows/convo/convo.html',
        'required': ['users']
    },
    'room': {
        'path': 'windows/room/room.html',
        'required': ['room', 'return-data']
    },
    'chat':{
        'path': 'windows/chat/chat.html',
        'required':[]
    },
    'signup':{
        'path': 'windows/signup/signup.html',
        'required':['email']
    }
}


let mainWindow, mainWindowHandler;

function goTo(pageKey, args) {

    let query = {}
    for (var arg of pages[pageKey]['required']) {
        query[arg] = args[arg]
    }

    console.log("going to ", pageKey, "with args", args)

    mainWindow.loadFile(pages[pageKey]['path'], { query: { "data": JSON.stringify(query) } })
}

async function createMainWindow() {
    let screenSize = screen.getPrimaryDisplay().workAreaSize
    mainWindow = new BrowserWindow({
        width: 1064,
        height: 1064 * screenSize.height / screenSize.width,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,       
        }
    })

    //Create a new handler for the mainWindow
    mainWindowHandler = new aspect(mainWindow);

    //define the ratio
    
    mainWindowHandler.setRatio(screenSize.width, screenSize.height, 10);


    

    try {
        
        await authService.refreshTokens();

        return goTo('lobby');
    } catch (err) {

        try {
            await createAuthWindow(mainWindow);
        }
        catch (err) {
            console.log(err)
        }

    }

    //createChatWindow('hello');

}

async function createAuthWindow(win) {


    ipcMain.on('go-to-ms-login', () => {

        win.loadURL(authService.getAuthenticationURL());
        const { session: { webRequest } } = win.webContents;

        const filter = {
            urls: [
                'http://localhost/callback*'
            ]
        };

        webRequest.onBeforeRequest(filter, async ({ url }) => {
            
            //check if needs signup
            if(!authService.isNeedSignup(url)){
                await authService.loadTokens(url);
                return goTo('roomMap', { source: 'default', 'extra-params': '' });
            }else{
                let email = authService.getSignupEmail(url);
                goTo('signup', {'email': email});
            }
        });
        win.on('authenticated', () => {
            goTo('roomMap', { source: 'default', 'extra-params': '' });
        });
    })

    goTo('login');
}

let chatWindow = null;
async function createChatWindow(data){

    chatWindow = new BrowserWindow({
        width: 300,
        height: 400,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,       
        },
        autoHideMenuBar:true,
        title: "Chat"
    })

    chatWindow.loadFile(pages['chat']['path'], { query: { "data": JSON.stringify(data) } })
    chatWindow.on('close', ()=>{chatWindowOpen=false})


}

//setting ipc events



ipcMain.on('goTo', (event, pageKey) => {
    event.returnValue = rootPath+'\\'+pages[pageKey]['path']
})
ipcMain.on('go-to', (event, pageKey) => {
    goTo(pageKey)
})
ipcMain.on('go-to-roommap', (event, source, extraParams) => {
    goTo('roomMap', { source: source, 'extra-params': extraParams });
})
ipcMain.on('go-to-room', (event, roomId, returnData) => {
    goTo('room', { room: roomId, 'return-data': returnData })
})
ipcMain.on('request-call', (event, userID) => {

    app.emit('request-call', userID)
})

app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

app.on('request-call', (userID) => {
    app.emit('call-accepted', userID)
})

app.on('call-accepted', (userID) => {
    ipcMain.send('call-accepted', ({users:[userID]}))
})

ipcMain.on('get-access-token', (event) => {
    console.log("getting access token");
    event.returnValue = getAccessToken()
})

ipcMain.on('get-all-cookies', deleteAllCookies)


//dealing with chat
ipcMain.on('open-chat-window', (event,data)=>{
    
    if(chatWindowOpen) return;
    createChatWindow(data)
    chatWindowOpen = true;
})

ipcMain.on('send_message', (event,message)=>{
    
    if(!chatWindowOpen) return;
    mainWindow.webContents.send('send_message', message)
})

ipcMain.on('message_recv', (event,message)=>{
    
    if(!chatWindowOpen) return;
    chatWindow.webContents.send('message_recv', message)
})


ipcMain.on('user_left_group', (event,user_id)=>{
    
    if(!chatWindowOpen) return;
    chatWindow.webContents.send('user_left_group', user_id)
})

ipcMain.on('user_added_group', (event,user)=>{
    
    if(!chatWindowOpen) return;
    chatWindow.webContents.send('user_added_group', user)
})

ipcMain.on('close-chat-window', (event)=>{
    
    if(!chatWindowOpen) return;
    chatWindow.destroy();
    chatWindowOpen = false;
})


//dealing with cookies



// Query all cookies.
async function getAllCookies(){
	console.log()
session.defaultSession.cookies.get({})
  .then((cookies) => {
	 cookies.forEach( (item, i) =>{
		 session.defaultSession.cookies.remove(item.domain+item.path, item.name).then(()=>{console.log('removed', item.name)}).catch((e)=>{console.log(e)})
		 
	 })
  }).catch((error) => {
    console.log(error)
  })
  session.defaultSession.cookies.flushStore();
}
function deleteAllCookies() {
	console.log('deleting')
  session.defaultSession.cookies.get({}).then((cookies) => {
	  console.log(cookies)
    cookies.forEach((cookie) => {
      let url = '';
      // get prefix, like https://www.
      url += cookie.secure ? 'https://' : 'http://';
      url += cookie.domain.charAt(0) === '.' ? 'www' : '';
      // append domain and path
      url += cookie.domain;
      url += cookie.path;
	  console.log(url);

      session.defaultSession.cookies.remove(url, cookie.name, (error) => {
        if (error) console.log(`error removing cookie ${cookie.name}`, error);
      });
    });
  });
}

