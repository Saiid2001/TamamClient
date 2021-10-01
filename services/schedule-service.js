const { SERVER_ADDRESS } = require("../config/settings.json");
const rootPath = require('electron-root-path').rootPath;
const axios = require("axios");
const url = require("url");
const $ = require('jquery')
const {ipcRenderer}= require('electron');

function getUserCourses( onSuccess = ()=>{}, onFail=()=>{}){

    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: SERVER_ADDRESS + "/courses" ,
        headers: { 'Authorization': "Bearer " + token },
        success: function (message, status, data) {
            onSuccess(data.responseJSON)
        }
    })
}

function setUserCourses(crns, onSuccess=()=>{}, onFail = ()=>{}){
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax(
        {
            type: "POST",
            url: SERVER_ADDRESS+"/courses/setCRNs",
            dataType: 'json',
            contentType: 'application/json',
            headers: { 'Authorization': "Bearer " + token },
            success: function (msg, status, data) {
                
                onSuccess(data.responseJSON)
                
            },
            error: function (msg){
                console.error(msg)
                onFail()
            },
 
            data: JSON.stringify({
                "classes":crns
            })
        }
    )
}

function getCommonCourses(user, onSuccess=()=>{}, onFail=()=>{}){
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax(
        {
            type: "GET",
            url: SERVER_ADDRESS+"/courses/common/"+user,
            headers: { 'Authorization': "Bearer " + token },
            success: function (msg, status, data) {
                
                onSuccess(data.responseJSON)
                
            },
            error: function (msg){
                console.error(msg)
                onFail()
            },
        }
    )
}

module.exports = {
    getUserCourses,
    setUserCourses,
    getCommonCourses
}