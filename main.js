'use strict';

const rootPath = require('electron-root-path').rootPath;
const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')


//setting the available pages to load
let pages = {
    'login': {
        'path': 'windows/login/login.html'
    },
    'lobby': {
        'path': 'windows/lobby/lobby.html'
    }
}


let mainWindow;

function goTo(pageKey) {
    mainWindow.loadFile(pages[pageKey]['path'])
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1064,
        height: 648,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,       
        }
    })

    goTo('login')
}

//setting ipc events

ipcMain.on('goTo', (event, pageKey) => {
    event.returnValue = rootPath+'\\'+pages[pageKey]['path']
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
