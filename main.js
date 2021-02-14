'use strict';

const { app, BrowserWindow } = require('electron')
const fs = require('fs')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule:true
        }
    })

    win.loadFile('windows/login/login.html')
}


app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
