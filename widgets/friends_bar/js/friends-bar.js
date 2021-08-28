
const friendsBar = {

    init() {
        let _this = this;

        this.userService = require('../../services/user-service.js');
        this.Fuse = require('fuse.js');

        this.friendsBtn = document.getElementById('friends-bar-btn');
        this.friendsBar = document.getElementById('friends-bar');
        this.closeBtn = document.getElementById('close-btn');
        this.onlineFriends = document.getElementById('online-friends');
        this.offlineFriends = document.getElementById('offline-friends');
        this.requestsList = document.getElementById('requests-list');
        this.requestsLabel = document.getElementById('requests-label');
        this.noFriendsText = document.getElementById('no-friends-label');
        this.noSearchResults = document.getElementById('no-search-results');
        this.showFriends = document.getElementById('show-friends');
        this.friendsListLable = document.getElementById('friends-list-type');
        this.friendSearch = document.querySelector('#friends-bar .search input');
        this.searchIcon = document.querySelector('#friends-bar .search img');
        this.searchedPeopleLabel = document.getElementById('searched-people-label');
        this.searchedPeople = document.getElementById('searched-people');

        let friendsbar = this.friendsBar; // Dirty, but functional for now
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

        this.friendsBtn.addEventListener('click', openSidebar);

        this.closeBtn.addEventListener('click', () => {
            _this.friendsBar.style.width = "0%";
        })

        this.initializeLists();

        this.offlineFriendsShown = false;

        this.showFriends.addEventListener("click", () => {
            if (!_this.offlineFriendsShown) {
                _this.offlineFriends.style.display = "block";
                _this.showFriends.innerHTML = "hide offline friends";
                _this.friendsListLable.innerHTML = "All friends";
                _this.offlineFriendsShown = true;
                _this.noFriendsText.style.display = "none";
            } else {
                _this.offlineFriends.style.display = "none";
                _this.showFriends.innerHTML = "view all friends";
                _this.friendsListLable.innerHTML = "On campus friends";
                _this.offlineFriendsShown = false;
                if (_this.onlineFriends.children.length == 0) {
                    _this.noFriendsText.style.display = "block";
                }
            }
        })


        this.friendSearch.addEventListener("search", () => {
            _this.initializeLists(_this.friendSearch.value);
        })
        this.searchIcon.addEventListener("click", () => {
            _this.initializeLists(_this.friendSearch.value);
        })
    },

    createPersonEntry(user, entryType) {
        let _this = this;

        let personEntry = document.createElement('div');
        personEntry.className = 'friend-entry';
        personEntry.id = `id-${user["_id"]}`; // Temporary, will look into it later

        let avatar = new Avatar(user["_id"], user);
        let avUrl = avatar.getHeadUrl().slice();

        personEntry.innerHTML = `<div class="friend-profile">
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
        personEntry.appendChild(nameplate);
        if (user["room"] != "NONE" && user["room"] != "map") {
            personEntry.innerHTML += `<img class="location" src="../../assets/img/friends_bar/pin_grey.svg" />`;
        } else if (user["room"] == "map") {
            personEntry.innerHTML += `<img class="location" src="../../assets/img/friends_bar/map_grey.svg" />`
        }
        if (entryType == "friend") {
            if (user["onlineStatus"] == "online") {
                _this.onlineFriends.appendChild(personEntry);
            } else {
                _this.offlineFriends.appendChild(personEntry);
            }
        } else {
            _this.searchedPeople.appendChild(personEntry);
        }

        let location = document.querySelector(`#id-${user["_id"]} .location`);
        location?.addEventListener("click", () => {
            _this.userService.getAllUsers((users) => {
                if (users[0]["room"] != "NONE" && users[0]["room"] != "map") {
                    ipcRenderer.send('go-to-room', users[0]["room"], { 'source': 'default', 'extraParams': '' });
                } else {
                    console.log("User not in valid room.")
                }
            }, { "_id": user["_id"] })
        })
    },

    createRequestEntry(user) {
        let _this = this;

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
        _this.requestsList.appendChild(requestentry);

        let acceptRequest = document.querySelector(`#id-${user["_id"]} .accept-request`);
        acceptRequest.addEventListener("click", () => {
            _this.userService.acceptFriendRequest(user["_id"], (data) => {
                console.log(data);
                acceptRequest.remove();
                requestentry.innerHTML += `<p>Friend request<br>accepted.</p>`;
                window.setTimeout(() => {
                    requestentry.style.display = "none";
                    _this.initializeLists(_this.friendSearch.data)
                }, 3000)
            })
        })
    },

    fuseSearch(list, searchQuery, searchOptions) {
        let _this = this;
        if (!(searchQuery == '')) {
            let fuseObject = new _this.Fuse(list, searchOptions);
            let searchResult = fuseObject.search(searchQuery);
            let searchedList = [];
            for (let entry of searchResult) {
                searchedList.push(entry.item);
            }
            return searchedList;
        } else {
            return list;
        }
    },

    initializeLists(searchQuery = '') {
        let _this = this;

        _this.onlineFriends.innerHTML = '';
        _this.offlineFriends.innerHTML = '';
        _this.requestsList.innerHTML = '';
        _this.searchedPeople.innerHTML = '';
        const searchOptions = {
            keys: ['firstName', 'lastName', 'major', 'enrollY', 'gradY'],
        };

        if (searchQuery) {
            _this.userService.getFriends((data) => {
                let searchedData = _this.fuseSearch(data, searchQuery, searchOptions);
                if (searchedData.length > 0) {
                    _this.friendsListLable.style.display = "block";
                    _this.showFriends.style.display = "block";
                    for (let user of searchedData) {
                        _this.createPersonEntry(user, "friend");
                    }
                    if (_this.onlineFriends.children.length == 0) {
                        _this.noFriendsText.innerHTML = "No friend currently on campus matches your search query.";
                        if (_this.offlineFriendsShown) {
                            console.log("Offline friends shown")
                            _this.noFriendsText.style.display = "none";
                        } else {
                            _this.noFriendsText.style.display = "block";
                        }
                    } else {
                        _this.noFriendsText.style.display = "none";
                    }
                } else {
                    _this.friendsListLable.style.display = "none";
                    _this.showFriends.style.display = "none";
                    _this.noFriendsText.style.display = "none";
                }
            });

            _this.userService.getIncomingFriendRequests((data) => {
                let searchedData = _this.fuseSearch(data, searchQuery, searchOptions);
                if (searchedData.length > 0) {
                    _this.requestsLabel.style.display = "block";
                    for (let user of searchedData) {
                        _this.createRequestEntry(user);
                    }
                } else {
                    _this.requestsLabel.style.display = "none";
                }
            })

            _this.searchedPeopleLabel.style.display = "block";

            _this.userService.searchUsers(searchQuery, (data) => {
                if (data.length > 0) {
                    _this.noSearchResults.style.display = "none";
                    for (let user of data) {
                        _this.createPersonEntry(user, "searched");
                    }
                } else {
                    _this.noSearchResults.style.display = "block";
                }
            })
        } else {
            _this.searchedPeopleLabel.style.display = "none";
            _this.noSearchResults.style.display = "none";
            _this.friendsListLable.style.display = "inline";

            _this.userService.getFriends((data) => {
                if (data.length > 0) {
                    _this.showFriends.style.display = "block";
                    for (let user of data) {
                        _this.createPersonEntry(user, "friend");
                    }
                    if (_this.onlineFriends.children.length == 0) {
                        _this.noFriendsText.innerHTML = "None of your friends are currently on virtual campus.";
                        if (_this.offlineFriendsShown) {
                            console.log("Offline friends shown")
                            _this.noFriendsText.style.display = "none";
                        } else {
                            _this.noFriendsText.style.display = "block";
                        }
                    } else {
                        _this.noFriendsText.style.display = "none";
                    }
                } else {
                    _this.noFriendsText.style.display = "block";
                    _this.noFriendsText.innerHTML = "You do not have any friends on TAMAM yet. Try hopping into a room and greeting someone!";
                    _this.showFriends.style.display = "none";
                }
            });

            _this.userService.getIncomingFriendRequests((data) => {
                _this.requestsLabel.style.display = "block";
                if (data.length > 0) {
                    for (let user of data) {
                        _this.createRequestEntry(user);
                    }
                } else {
                    _this.requestsLabel.style.display = "none";
                }
            })
        }
    },

    changeStatusDot(userID, status) {
        let statusDot = document.querySelector(`#id-${userID} .status-dot`);
        if (status == "online") {
            statusDot.src = "../../assets/img/friends_bar/greendot.svg";
        } else {
            statusDot.src = "../../assets/img/friends_bar/greydot.svg";
        }
    },
}

