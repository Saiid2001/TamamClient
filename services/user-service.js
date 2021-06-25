const { SERVER_ADDRESS } = require("../config/settings.json");
const rootPath = require('electron-root-path').rootPath;
const axios = require("axios");
const url = require("url");
const $ = require('jquery')
const {ipcRenderer}= require('electron')



function getUserData(onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/users/get-user",
        headers: { 'Authorization':"Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseJSON)
        },
        error: function (message, status, data) {
            //onAssessmentLoaded();
            console.log(message);
            onFail();
        }
    });
}

function getAllUsers(onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/users/get-users",
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            onSuccess(data.responseJSON);
        },
        error: function (message, status, data) {
            //onAssessmentLoaded();
            console.log(message);
            onFail();
        }
    });
}

module.exports = {
    getUserData,
    getAllUsers
}