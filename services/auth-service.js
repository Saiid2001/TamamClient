const jwtDecode = require("jwt-decode");
const axios = require("axios");
const url = require("url");
const envVariables = require("../config/settings.json");
const keytar = require("keytar");
const os = require("os");
const {session} = require('electron')

const { SERVER_ADDRESS, AUTHENTICATE_ADDRESS, REFRESH_ADDRESS } = envVariables;

const redirectUri = "http://localhost/callback";

const keytarService = "electron-openid-oauth";
const keytarAccessService = 'electron-access-token';
const keytarAccount = os.userInfo().username;

let accessToken = null;
let profile = null;
let refreshToken = null;

function getAccessToken() {
    console.log("getting token")
    return accessToken

}
function getProfile() {
    
}

function getAuthenticationURL() {
    return (SERVER_ADDRESS + AUTHENTICATE_ADDRESS);
}

async function refreshTokens() {
    const refreshToken = await keytar.getPassword(keytarService, keytarAccount);
    if (refreshToken) {
        console.log('refresh')
        const refreshOptions = {
            method: "POST",
            url: SERVER_ADDRESS+REFRESH_ADDRESS,
            headers: {
                'Authorization': ' Bearer ' + refreshToken,
                'Content-Type': 'Application/json'
            },
            data: {
                'refresh_token': refreshToken
            }
        };

        try {
            const response = await axios(refreshOptions);
            
            accessToken = response.data.access_token;

            session.defaultSession.cookies.set({ url: "app://auth.access.token", name: "access-token", value: accessToken })
            //await keytar.setPassword(keytarAccessService, keytarAccount, accessToken);

            
        } catch (error) {
            
            await logout();

            throw error;
        }
    } else {
        throw new Error("No available refresh token.");
    }
}

async function loadTokens(callbackURL) {
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;

    //const exchangeOptions = {
    //    grant_type: "authorization_code",
    //    client_id: clientId,
    //    code: query.code,
    //    redirect_uri: redirectUri,
    //};

    //const options = {
    //    method: "POST",
    //    url: `https://${auth0Domain}/oauth/token`,
    //    headers: {
    //        "content-type": "application/json",
    //    },
    //    data: JSON.stringify(exchangeOptions),
    //};

    try {
        //const response = await axios(options);

        accessToken = query.access_token;
        //profile = jwtDecode(response.data.id_token);
        refreshToken = query.refresh_token;


        console.log(refreshToken)

        if (refreshToken) {
            await keytar.setPassword(keytarService, keytarAccount, refreshToken);
        }
    } catch (error) {
        console.log(error)
        await logout();

        throw error;
    }
}

async function logout() {
    await keytar.deletePassword(keytarService, keytarAccount).then(()=>{console.log("removed refresh token")}).catch(e=>{console.log});
    accessToken = null;
    profile = null;
    refreshToken = null;
}

function getLogOutUrl() {
    return `https://${auth0Domain}/v2/logout`;
}

module.exports = {
    getAccessToken,
    getAuthenticationURL,
    getLogOutUrl,
    getProfile,
    loadTokens,
    logout,
    refreshTokens,
};