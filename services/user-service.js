const { SERVER_ADDRESS } = require("../config/settings.json");
const rootPath = require('electron-root-path').rootPath;
const axios = require("axios");
const url = require("url");
const $ = require('jquery')
const {ipcRenderer}= require('electron');



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


function getAllUsers(onSuccess, params = null, onFail = () => { }) {

    let paramString = "";
    if (params) {
        paramString = `?`;
        for (let param in params) {
            paramString += `${param}=${params[param]}&`
        }
    }

    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/users/get-users" + paramString,
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


function getFriends(onSuccess, room = null, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');

    var paramString = ""
    if (room) {
        paramString = '?room=' + room
    }

    console.log(paramString)

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/relations/friendships" + paramString,
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseJSON)
        }
    })
}

function getIncomingFriendRequests(onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/relations/friendships/requests/received",
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseJSON)
        }
    })
}

function getOutgoingFriendRequests(onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/relations/friendships/requests/sent",
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseJSON)
        }
    })
}

function sendFriendRequest(userID, onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/relations/friendships/request/" + userID,
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseJSON)
        }
    })
}

function acceptFriendRequest(userID, onSuccess, onFail = () => { }) {
    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/relations/friendships/accept/" + userID,
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            console.log(message)
            onSuccess(data.responseText)
        }
    })
}

module.exports = {
    getUserData,
    getAllUsers,
    getFriends,
    getIncomingFriendRequests,
    getOutgoingFriendRequests,
    sendFriendRequest,
    acceptFriendRequest
}