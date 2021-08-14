
let friendsbtn = document.getElementById('friends-bar-btn')
let friendsbar = document.getElementById('friends-bar')
let closebtn = document.getElementById('close-btn')

function openSidebar() {
    friendsbar.style.width = "370px";
    let view = document.querySelector('.view');
    view.addEventListener('click', () => {
        if (event.pageX < view.getBoundingClientRect().width - 370) {
            friendsbar.style.width = "0%";
            view.removeEventListener('click', openSidebar);
        }
    })
}

function createFriendEntry(user, onlinefriends, offlinefriends) {
    let friendentry = document.createElement('div');
    friendentry.className = 'friend-entry';
    friendentry.id = `id-${user["_id"]}`; // Temporary, will look into it later

    let avatar = new Avatar(user["_id"], user);
    let avUrl = avatar.getHeadUrl().slice();

    friendentry.innerHTML = `<div class="friend-profile">
                             <img src="${avUrl}" />
                             </div>`;
    let nameplate = document.createElement('div');
    nameplate.className = 'name-plate';
    nameplate.innerHTML = `<p class="name">${user["firstName"]} ${user["lastName"]}</p>`;

    if (user["onlineStatus"] == "online") {
        nameplate.innerHTML += `<img class="status-dot" src="../../assets/img/friends_bar/greendot.svg" />`;
    } else {
        nameplate.innerHTML += `<img class="status-dot" src="../../assets/img/friends_bar/greydot.svg" />`;
    }
    friendentry.appendChild(nameplate);
    friendentry.innerHTML += `<img class="msg" src="../../assets/img/friends_bar/msg_grey.svg" />
                              <img class="location" src="../../assets/img/friends_bar/pin_grey.svg" />`;
    if (user["onlineStatus"] == "online") {
        onlinefriends.appendChild(friendentry);
    } else {
        offlinefriends.appendChild(friendentry);
    }

    let tempRequestSender = document.querySelector(`#id-${user["_id"]}`);
    tempRequestSender.addEventListener("click", () => {
        users.sendFriendRequest(user["_id"], (data) => {
            console.log(data);
        })
    })
}

function createRequestEntry(user, requestslist) {
    let requestentry = document.createElement('div');
    requestentry.className = 'friend-entry';
    requestentry.id = `id-${user["_id"]}`; // Temporary, will look into it later

    let avatar = new Avatar(user["_id"], user);
    let avUrl = avatar.getHeadUrl().slice();

    requestentry.innerHTML = `<div class="friend-profile">
                             <img src="${avUrl}" />
                             </div>
                            <div class="name-plate">
                                <p class="name">${user["firstName"]} ${user["lastName"]}</p>
                            </div>
                            <button class="accept-request">Accept</button>`;
    requestslist.appendChild(requestentry);

    let acceptRequest = document.querySelector(`#id-${user["_id"]} .accept-request`);
    acceptRequest.addEventListener("click", () => {
        users.acceptFriendRequest(user["_id"], (data) => {
            console.log(data);
            if (data == "Friend request accepted") {
                acceptRequest.remove();
                requestentry.innerHTML += `<p>Friend request accepted.</p>`;
            }
        })
    })
}

function fuseSearch(list, searchQuery, searchOptions) {
    if (!(searchQuery == '')) {
        let fuseObject = new Fuse(list, searchOptions);
        let searchResult = fuseObject.search(searchQuery);
        let searchedList = [];
        for (let entry of searchResult) {
            searchedList.push(entry.item);
        }
        return searchedList;
    } else {
        return list;
    }
}

function initializeLists(onlinefriends, offlinefriends, requestslist, searchQuery = '') {
    onlinefriends.innerHTML = '';
    offlinefriends.innerHTML = '';
    requestslist.innerHTML = '';
    const searchOptions = {
        keys: ['firstName', 'lastName'],
    };
    users.getFriends((data) => {
        searchedData = fuseSearch(data, searchQuery, searchOptions);
        if (searchedData.length > 0) {
            for (let user of searchedData) {
                createFriendEntry(user, onlinefriends, offlinefriends);
            }
        }
    });

    users.getIncomingFriendRequests((data) => {
        searchedData = fuseSearch(data, searchQuery, searchOptions);
        if (searchedData.length > 0) {
            for (let user of searchedData) {
                createRequestEntry(user, requestslist);
            }
        }
    })
}

function changeStatusDot(userID, status) {
    let statusDot = document.querySelector(`#id-${userID} .status-dot`);
    if (status == "online") {
        statusDot.src = "../../assets/img/friends_bar/greendot.svg";
    } else {
        statusDot.src = "../../assets/img/friends_bar/grerdot.svg";
    }
}

friendsbtn.addEventListener('click', openSidebar);

closebtn.addEventListener('click', () => {
    friendsbar.style.width = "0%";
})

let onlinefriends = document.getElementById('online-friends');
let offlinefriends = document.getElementById('offline-friends');
let requestslist = document.getElementById('requests-list');

initializeLists(onlinefriends, offlinefriends, requestslist);

let friendsShown = false;

let showfriends = document.getElementById('show-friends');
let friendsListLable = document.getElementById('friends-list-type');
showfriends.addEventListener("click", () => {
    if (!friendsShown) {
        offlinefriends.style.display = "block";
        showfriends.innerHTML = "hide offline friends";
        friendsListLable.innerHTML = "All friends";
        friendsShown = true;
    } else {
        offlinefriends.style.display = "none";
        showfriends.innerHTML = "view all friends";
        friendsListLable.innerHTML = "On campus friends";
        friendsShown = false;
    }
})

let friendsearch = document.querySelector('#friends-bar .search input');
let searchicon = document.querySelector('#friends-bar .search img');
friendsearch.addEventListener("search", () => {
    initializeLists(onlinefriends, offlinefriends, requestslist, friendsearch.value);
})
searchicon.addEventListener("click", () => {
    initializeLists(onlinefriends, offlinefriends, requestslist, friendsearch.value);
})
