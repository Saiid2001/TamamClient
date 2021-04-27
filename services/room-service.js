const { SERVER_ADDRESS } = require("../config/settings.json");
const rootPath = require('electron-root-path').rootPath;
const axios = require("axios");
const url = require("url");
const $ = require('jquery')
const {ipcRenderer}= require('electron')



function getRoom(roomId, onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/rooms/get-room/"+roomId,
        headers: { 'Authorization':"Bearer " + token },
        success: function (message, status, data) {
            console.log(data)
            onSuccess(data.responseJSON)
        },
        error: function (message, status, data) {
            onFail();
        }
    });
}
function getRooms(query, onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/rooms/get-rooms",
        data: query,
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            onSuccess(data.responseJSON)
        },
        error: function (message, status, data) {
            onFail();
        }
    });
}
module.exports = {
    getRoom,
    getRooms
}