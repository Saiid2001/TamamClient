const { getUserData } = require('../../services/user-service')

let User = null;
getUserData(user => {

    User = user;
    populateUserLabels(user)
    document.dispatchEvent(new Event('user-ready'))
})
function populateUserLabels(user) {
    function greetUser(user) {
        console.log(user)
        document.getElementById('header-greeting').innerHTML = `Hello ${user['firstName']}!`
    }
    function fillUsername(user) {
        document.getElementById('username').innerHTML = user['firstName']+" "+user['lastName']
    }
    greetUser(user)
    fillUsername(user)
}



