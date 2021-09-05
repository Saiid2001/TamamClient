
const PIXI = require('pixi.js');
const rooms = require('../../services/room-service');
const users = require('../../services/user-service.js');

class GlobalMap {



    constructor(canvas, bg) {


        let _this = this;

        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms;
        });
        users.getFriends((users) => {
            _this.users = users
        })

        console.log(canvas.getBoundingClientRect().width);

        //_this.heightFactor = 0.485;
        let app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight - 35,
            autoResize: true,
            resolution: devicePixelRatio
        });

        canvas.appendChild(app.view);

        app.loader.add([
            bg,
            './assets/map_pin.svg'
        ])
            .load(setup);

        function setup() {

            let background = new PIXI.Sprite(app.loader.resources[bg].texture);
            background.width = canvas.getBoundingClientRect().width;
            background.height = background.width * 3 / 4;
            app.stage.addChild(background);

            function resize(stage) {
                
                app.renderer.resize(window.innerWidth, window.innerHeight - 35);

                let oldHeight = stage.height / stage.scale.y;
                let oldWidth = stage.width / stage.scale.x;
                let width = document.body.getBoundingClientRect().width;
                let height = document.body.getBoundingClientRect().height;

                let scaleX = width / oldWidth;
                let scaleY = height / oldHeight;

                let minScale = Math.max(scaleX, scaleY)


                stage.scale.set(minScale);
                
            }

            window.addEventListener('resize', () => {

                resize(app.stage);

                _this.originalScale = app.stage.scale.x;
                _this.rebound(app.stage);

            })
            let foreground;

            rooms.getRooms({ 'open': '' }, (rooms) => {
                _this.rooms = rooms
                foreground =  _this.addRooms(_this.rooms);
                app.stage.addChild(foreground);
            })
            users.getAllUsers((users) => {
                _this.users = users;
            })
             
            canvas.addEventListener("wheel", (event) => {
                event.preventDefault();
                if (event.deltaY < 0) {
                    _this.zoomIn(event, app.stage);
                } else {
                    _this.zoomOut(event, app.stage);
                }
                _this.rebound(app.stage);

            })

            // TODO: Add pinch zoom events

            let mouseDown = false;

            canvas.addEventListener("pointerdown", () => {
                canvas.style.cursor = "grabbing";
                mouseDown = true;
            });

            canvas.addEventListener("pointerup", () => {
                mouseDown = false;
                canvas.style.cursor = "grab";
                _this.rebound(app.stage);
            });

            canvas.addEventListener("pointermove", (event) => {
                if (mouseDown) {
                    _this.pan(event, app.stage);
                }
            });

            _this.zoomin = document.getElementById("zoom-in");
            _this.zoomout = document.getElementById("zoom-out");

            _this.zoomin.addEventListener("click", (event) => {
                _this.zoomIn(event, app.stage, true);
                _this.rebound(app.stage);
            });


            _this.zoomout.addEventListener("click", (event) => {
                _this.zoomOut(event, app.stage, false);
                _this.rebound(app.stage);
            });
        }

        this.app = app;
        this.canvas = canvas;
        this.mapRooms = {};
        this.curUsers = {};
        this.scaleFactor = this.canvas.getBoundingClientRect().width / 2000;
        this.originalScale = this.app.stage.scale.x;
    }

    addRoom(info, position) {

        let _this = this;

        this.mapRooms[info["_id"]] = {
            roomContainer: new PIXI.Container(),
            roomObjects: new PIXI.Container(),
        };

        // Positioning main room container on map

        let roomContainer = this.mapRooms[info["_id"]].roomContainer;
        roomContainer.interactive = true;
        roomContainer.buttonMode = true;
        roomContainer.x = position.x * _this.scaleFactor;
        roomContainer.y = position.y * _this.scaleFactor;

        // Creating room name text object, on mouseenter it is added to the room container, on mouseleave it is removed


        // Filling up roomObjects container with avatars or roomPin then adding it to main roomContainer

        let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
        roomPin.width = roomPin.texture.baseTexture.realWidth * _this.scaleFactor;
        roomPin.height = roomPin.texture.baseTexture.realHeight * _this.scaleFactor;

        let roomObjects = this.mapRooms[info["_id"]].roomObjects;

        if (info['users'].length != 0) {
            for (let i = 0; i < info['users'].length; ++i) {
                let userData = _this.users.find((user) => user['_id'] == info['users'][i]);
                let avatar = new Avatar(info['users'][i], userData);
                this.curUsers[info['users'][i]] = avatar.getFullBody(true, false);
                let avatarBody = this.curUsers[info['users'][i]];
                avatarBody.scale.set(0.55 * _this.scaleFactor);
                avatarBody.position.x = (-(info['users'].length-1)/2 + i) * 32 * _this.scaleFactor;
                avatarBody.position.y = -75 * _this.scaleFactor;
                roomObjects.addChild(avatarBody);
            }
        } else {
            roomObjects.addChild(roomPin);
        }

        roomContainer.addChild(roomObjects);

        this.mapRooms[info["_id"]].roomName = new PIXI.Text(info["name"], {
            fontFamily: "Roboto",
            fontSize: 36 * _this.scaleFactor,
            fill: "white",
            align: 'center',
            fontWeight: 'bolder',
            dropShadow: true,
            dropShadowBlur: 15
        });
        let roomName = this.mapRooms[info["_id"]].roomName;
        roomName.y = 55 * _this.scaleFactor;
        roomName.x = -(roomName.width / 2 - roomContainer.width / 2) * _this.scaleFactor;
        //roomContainer.addChild(roomName);


        // Creating events

        roomContainer.on('pointertap', () => {
            
            
            ipcRenderer.send('socketEmit', 'ExitRoom', {roomId:"map"});

            if (info['name'] == "Main Gate") {
                let r = ipcRenderer.send('go-to', 'lobby')
            } else {
                openRoomPreview(info);
            }
        });
        roomContainer.on('mouseover', () => {
            _this.mapRooms[info["_id"]].roomContainer.addChild(_this.mapRooms[info["_id"]].roomName);
        });
        roomContainer.on('mouseout', () => {
            _this.mapRooms[info["_id"]].roomContainer.removeChild(_this.mapRooms[info["_id"]].roomName);
        });

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
            _this.mapRooms[roomID].roomObjects.removeChildren();
        }

        let roomObjects = this.mapRooms[roomID].roomObjects;
        let newLength = roomObjects.children.length + 1;
        for (let i = 0; i < newLength - 1; ++i) {
            roomObjects.children[i].position.x = (-(newLength - 1) / 2 + i) * 32 * _this.scaleFactor;
        }

        let avatar = new Avatar(user["_id"], user);
        this.curUsers[user["_id"]] = avatar.getFullBody(true, false);
        let avatarBody = this.curUsers[user["_id"]];
        avatarBody.scale.set(0.6 * _this.scaleFactor);
        avatarBody.position.x = (-(newLength - 1) / 2 + newLength - 1) * 32 * _this.scaleFactor;
        avatarBody.position.y = -75 * _this.scaleFactor;
        roomObjects.addChild(avatarBody);
    }

    removeUserFromRoom(user, roomID) {
        console.log('Removing user', user ,' from ', roomID)
        let _this = this;
        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms;
        });

        if (user["_id"] in this.curUsers) {

            let roomObjects = _this.mapRooms[roomID].roomObjects;
            roomObjects.removeChild(this.curUsers[user["_id"]]);

            let newLength = roomObjects.children.length;
            if (newLength == 0) {
                let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
                roomPin.width = roomPin.texture.baseTexture.realWidth * _this.scaleFactor;
                roomPin.height = roomPin.texture.baseTexture.realHeight * _this.scaleFactor;
                roomObjects.addChild(roomPin);
            } else {
                for (let i = 0; i < newLength; ++i) {
                    roomObjects.children[i].position.x = (-(newLength - 1) / 2 + i) * 32 * _this.scaleFactor;
                }
            }
            delete this.curUsers[user["_id"]];
        }
    }

    addRooms(roomList) {
        const _this = this

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

    zoomIn(event, stage, fromButton = false) {
        let _this = this;
        let delta = fromButton ? -1250 : event.deltaY;

        // Transforming coordinates to new coordinate system
        let appBounds = {
            width: _this.canvas.getBoundingClientRect().width,
            height: _this.canvas.getBoundingClientRect().height,
        }
        let offsetX = fromButton ? appBounds.width / 2 : event.offsetX;
        let offsetY = fromButton ? appBounds.height / 2 : event.offsetY;
        let stagePos1 = stage.toLocal(new PIXI.Point(offsetX, offsetY));

        if (delta > -100) {
            delta *= 5;
        }
        if (stage.scale.x * (1 - delta / 2500) <= _this.originalScale * 2) {
            stage.scale.set(stage.scale.x * (1 - delta / 2500));
        } else {
            stage.scale.set(_this.originalScale * 2);
        }
        
        let stagePos2 = stage.toLocal(new PIXI.Point(offsetX, offsetY));
        stage.pivot.x -= stagePos2.x - stagePos1.x;
        stage.pivot.y -= stagePos2.y - stagePos1.y;
        
    }

    zoomOut(event, stage, fromButton = false) {
        let _this = this;
        let delta = fromButton ? 1250 : event.deltaY;

        // Transforming coordinates to new coordinate system
        let appBounds = {
            width: _this.canvas.getBoundingClientRect().width,
            height: _this.canvas.getBoundingClientRect().height,
        }
        let offsetX = fromButton ? appBounds.width / 2 : event.offsetX;
        let offsetY = fromButton ? appBounds.height / 2 : event.offsetY;
        let stagePos1 = stage.toLocal(new PIXI.Point(offsetX, offsetY));

        if (delta < 100) {
            delta *= 5;
        }
        if (stage.scale.x / (1 + delta / 2500) > _this.originalScale) {
            stage.scale.set(stage.scale.x / (1 + delta / 2500));
        } else {
           stage.scale.set(_this.originalScale);
        }
        
        let stagePos2 = stage.toLocal(new PIXI.Point(offsetX, offsetY));
        stage.pivot.x -= stagePos2.x - stagePos1.x;
        stage.pivot.y -= stagePos2.y - stagePos1.y;
        
 
    }

    rebound(stage) {
        let _this = this;
        let stageBounds = stage.getBounds();
        let appBounds = {
            width: _this.canvas.getBoundingClientRect().width,
            height: _this.canvas.getBoundingClientRect().height,
        }

        if (stageBounds.x > 0) {
            stage.x -= stageBounds.x;

        } else if (stageBounds.x + stageBounds.width < appBounds.width) {
            stage.x += appBounds.width - (stageBounds.x + stageBounds.width);
        }
        if (stageBounds.y > 0) {
            stage.y -= stageBounds.y;

        } else if (stageBounds.y + stageBounds.height < appBounds.height) {
            stage.y += appBounds.height - (stageBounds.y + stageBounds.height);
        }

    }

    pan(event, stage) {
        let _this = this;
        let stageBounds = stage.getBounds();
        let appBounds = {
            width: _this.canvas.getBoundingClientRect().width,
            height: _this.canvas.getBoundingClientRect().height,
        }
        let panCst = 2.5;
        if ((stageBounds.x <= 0 || stageBounds.x > 0 && event.movementX < 0) && (stageBounds.x + stageBounds.width >= appBounds.width || stageBounds.x + stageBounds.width < appBounds.width && event.movementX > 0)) {
            stage.x += event.movementX / (panCst);
        }
        if ((stageBounds.y <= 0 || stageBounds.y > 0 && event.movementY < 0) && (stageBounds.y + stageBounds.height >= appBounds.height || stageBounds.y + stageBounds.height < appBounds.height && event.movementY > 0)) {
            stage.y += event.movementY / (panCst);
        }

        _this.rebound(stage);
    }

}
