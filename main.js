'use strict';

const rootPath = require('electron-root-path').rootPath;
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const fs = require('fs')
const {connectSocket} = require('./services/socket-service')
const aspect = require('electron-aspectratio')


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
    'convo': {
        'path': 'windows/convo/convo.html',
        'required': ['users']
    }
}


let mainWindow, mainWindowHandler;

function goTo(pageKey, args) {

    let query = {}
    for (var arg of pages[pageKey]['required']) {
        console.log(args)
        query[arg] = args[arg]
    }

    mainWindow.loadFile(pages[pageKey]['path'], { query: { "data": JSON.stringify(query) } })
}

function createMainWindow() {
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

    goTo('login')
}

//setting ipc events

ipcMain.on('goTo', (event, pageKey) => {
    event.returnValue = rootPath+'\\'+pages[pageKey]['path']
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
    goTo('convo', {users: [userID]})
})


