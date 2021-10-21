const { SERVER_ADDRESS } = require("../config/settings.json");
const rootPath = require('electron-root-path').rootPath;
const axios = require("axios");
const url = require("url");
const $ = require('jquery')
const {ipcRenderer}= require('electron');

const settings = require('electron-settings')
function _getServerAddress(){

    return settings.getSync('SERVER_ADDRESS')
}

function getUserCourses( onSuccess = ()=>{}, onFail=()=>{}){

    let token = ipcRenderer.sendSync('get-access-token');

    $.ajax({
        type: 'GET',
        method: 'GET',
        url: _getServerAddress() + "/courses" ,
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
            url: _getServerAddress()+"/courses/setCRNs",
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
            url: _getServerAddress()+"/courses/common/"+user,
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

function getUpcomingEvents(onSuccess = ()=>{}, onFail= ()=>{}){
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax(
        {
            type: "GET",
            url: _getServerAddress()+"/courses/upcoming",
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

function getCourseMeetingLink(CRN, onSuccess = ()=>{}, onFail= ()=>{}){
    let token = ipcRenderer.sendSync('get-access-token');
    $.ajax(
        {
            type: "GET",
            url: _getServerAddress()+"/courses/byCRN/"+CRN+"/link",
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

function setCourseMeetingLink(CRN, link, onSuccess=()=>{}, onFail = ()=>{}){
    let token = ipcRenderer.sendSync('get-access-token');
    console.log(link)
    $.ajax(
        {
            type: "POST",
            url: _getServerAddress()+"/courses/byCRN/"+CRN+"/link",
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
                "link":link
            })
        }
    )
}

module.exports = {
    getUserCourses,
    setUserCourses,
    getCommonCourses,
    getUpcomingEvents,
    getCourseMeetingLink,
    setCourseMeetingLink
}