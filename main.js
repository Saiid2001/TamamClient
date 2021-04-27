'use strict';

const rootPath = require('electron-root-path').rootPath;
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const fs = require('fs')
const authService = require('./services/auth-service');
const aspect = require('electron-aspectratio')
const { session } = require('electron');
const { getAccessToken } = require('./services/auth-service');

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
        'required': []
    },
    'convo': {
        'path': 'windows/convo/convo.html',
        'required': ['users']
    },
    'room': {
        'path': 'windows/room/room.html',
        'required': ['room']
    }
}


let mainWindow, mainWindowHandler;

function goTo(pageKey, args) {

    let query = {}
    for (var arg of pages[pageKey]['required']) {
        query[arg] = args[arg]
    }

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
            
            await authService.loadTokens(url);
            return goTo('lobby');
        });
        win.on('authenticated', () => {
            goTo('lobby');
        });
    })

    goTo('login');
}


//setting ipc events



ipcMain.on('goTo', (event, pageKey) => {
    event.returnValue = rootPath+'\\'+pages[pageKey]['path']
})
ipcMain.on('go-to', (event, pageKey) => {
    goTo(pageKey)
})
ipcMain.on('go-to-room', (event, roomId) => {
    goTo('room', { room: roomId })
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

