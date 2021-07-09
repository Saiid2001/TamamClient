const PIXI = require('pixi.js');
const rooms = require('../../services/room-service');
const users = require('../../services/user-service.js');

class GlobalMap {



    constructor(canvas, bg) {


        let _this = this;

        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms;
        });
        users.getAllUsers((users) => {
            _this.users = users
        })

        console.log(canvas.getBoundingClientRect().width);

        let app = new PIXI.Application({
            width: canvas.getBoundingClientRect().width,
            height: canvas.getBoundingClientRect().width * 3 / 4,
            autoResize: true,
            resolution: devicePixelRatio
        });

        canvas.appendChild(app.view);

        app.loader.add([
            bg,
            './assets/map_pin.svg',
            './assets/location_on.png'
        ])
            .load(setup);

        function setup() {

            let background = new PIXI.Sprite(app.loader.resources[bg].texture);
            background.width = canvas.getBoundingClientRect().width;
            background.height = background.width * 3 / 4;
            app.stage.addChild(background);

            function resize() {
                app.renderer.resize(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().width * 3 / 4);

                let oldHeight = app.stage.height / app.stage.scale.y;
                let oldWidth = app.stage.width / app.stage.scale.x;
                let width = document.body.getBoundingClientRect().width;
                let height = document.body.getBoundingClientRect().height;

                let scaleX = width / oldWidth;
                let scaleY = height / oldHeight;

                let minScale = Math.max(scaleX, scaleY)


                app.stage.scale.set(minScale);
            }

            window.addEventListener('resize', () => {
                console.log(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().width * 3 / 4);
                resize()
            })
            let foreground;

            rooms.getRooms({ 'open': '' }, (rooms) => {
                _this.rooms = rooms
                foreground =  _this.addRooms(_this.rooms);
                app.stage.addChild(foreground);
                console.log(_this.rooms)
            })
            users.getAllUsers((users) => {
                _this.users = users;
                console.log(_this.users)
            })
             
            

        }



        this.app = app;
        this.canvas = canvas;
        this.mapRooms = {};
        this.curUsers = {};
    }

    addRoom(info, position) {
        let _this = this;
        let scaleFactor = _this.canvas.getBoundingClientRect().width / 2000;

        let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
        roomPin.width = roomPin.texture.baseTexture.realWidth * scaleFactor;
        roomPin.height = roomPin.texture.baseTexture.realHeight * scaleFactor;

        this.mapRooms[info["_id"]] = new PIXI.Container();
        let roomContainer = this.mapRooms[info["_id"]];
        roomContainer.interactive = true;
        roomContainer.buttonMode = true;
        roomContainer.x = position.x * scaleFactor;
        roomContainer.y = position.y * scaleFactor;
        roomContainer.on('mousedown', () => {
            socket.connectSocket(() => {
                socket.exitRoom("map");
            })
            if (info['name'] == "Main Gate") {

                let r = ipcRenderer.send('go-to', 'lobby')

            } else {

                let r = ipcRenderer.send('go-to-room', info['_id'], urlData)

            }
        });

        if (info['users'].length != 0) {
            for (let i = 0; i < info['users'].length; ++i) {
                let userData = _this.users.find((user) => user['_id'] == info['users'][i]);
                let avatar = new Avatar(info['users'][i], userData);
                this.curUsers[info['users'][i]] = avatar.getFullBody(true, false);
                let avatarBody = this.curUsers[info['users'][i]];
                avatarBody.scale.set(0.6 * scaleFactor);
                avatarBody.position.x = (-(info['users'].length-1)/2 + i) * 32 * scaleFactor;
                avatarBody.position.y = -75 * scaleFactor;
                roomContainer.addChild(avatarBody);
            }
        } else {
            roomContainer.addChild(roomPin);
        }

        console.log(this.curUsers);

        return roomContainer;
        
    }

    addUserToRoom(user, roomID) {
        let _this = this;
        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms;
        });

        if (user["_id"] in this.curUsers) {
            _this.removeUserFromRoom(user, user.room);
            delete this.curUsers[user["_id"]];
        }

        let room = _this.rooms.find((room) => room["_id"] == roomID);
        if (room.users.length == 0) {
            _this.mapRooms[roomID].removeChildren();
        }

        let scaleFactor = _this.canvas.getBoundingClientRect().width / 2000;
        let roomContainer = this.mapRooms[roomID];
        let newLength = roomContainer.children.length + 1;
        for (let i = 0; i < newLength - 1; ++i) {
            roomContainer.children[i].position.x = (-(newLength - 1) / 2 + i) * 32 * scaleFactor;
        }

        let avatar = new Avatar(user["_id"], user);
        this.curUsers[user["_id"]] = avatar.getFullBody(true, false);
        let avatarBody = this.curUsers[user["_id"]];
        avatarBody.scale.set(0.6 * scaleFactor);
        avatarBody.position.x = (-(newLength - 1) / 2 + newLength - 1) * 32 * scaleFactor;
        avatarBody.position.y = -75 * scaleFactor;
        roomContainer.addChild(avatarBody);
    }

    removeUserFromRoom(user, roomID) {
        let _this = this;
        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms;
        });

        if (user["_id"] in this.curUsers) {

            let roomContainer = _this.mapRooms[roomID];
            roomContainer.removeChild(this.curUsers[user["_id"]]);

            let newLength = roomContainer.children.length;
            let scaleFactor = _this.canvas.getBoundingClientRect().width / 2000;
            if (newLength == 0) {
                let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
                roomPin.width = roomPin.texture.baseTexture.realWidth * scaleFactor;
                roomPin.height = roomPin.texture.baseTexture.realHeight * scaleFactor;
                roomContainer.addChild(roomPin);
            } else {
                for (let i = 0; i < newLength; ++i) {
                    roomContainer.children[i].position.x = (-(newLength - 1) / 2 + i) * 32 * scaleFactor;
                }
            }
            delete this.curUsers[user["_id"]];
        }
    }

    addRooms(roomList) {
        const _this = this

        console.log(roomList)

        let buildingRooms = roomList.sort((a, b) => {
            if (a.mapInfo.layer < b.mapInfo.layer) {
                return -1
            } else if (a.mapInfo.layer > b.mapInfo.layer) {
                return 1
            } else {
                return 0
            }
        }
        )

        console.log(buildingRooms)

        let foreground = new PIXI.Container();
        buildingRooms.forEach((room, i) => {
            let roomContainer = _this.addRoom(
                room,
                room['mapInfo']['pos'],

            )
            foreground.addChild(roomContainer);
        })
        return foreground
    }
}
