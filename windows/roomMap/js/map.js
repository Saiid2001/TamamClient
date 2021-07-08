const PIXI = require('pixi.js');

class GlobalMap {



    constructor(canvas, bg, rooms, users) {

        let _this = this;

        _this.rooms = rooms
        _this.users = users;

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

            let foreground = _this.addRooms(_this.rooms);
            app.stage.addChild(foreground);

        }



        this.app = app;
        this.canvas = canvas;
        this.mapRooms = {};
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

        console.log(info);

        if (info['users'].length != 0) {
            for (let i = 0; i < info['users'].length; ++i) {
                let userData = _this.users.find((user) => user['_id'] == info['users'][i]);
                let avatar = new Avatar(info['users'][i], userData);
                let avatarBody = avatar.getFullBody(true, false);
                avatarBody.scale.set(0.6 * scaleFactor);
                avatarBody.position.x = (-(info['users'].length-1)/2 + i) * 32 * scaleFactor;
                avatarBody.position.y = -75 * scaleFactor;
                roomContainer.addChild(avatarBody);
            }
        } else {
            roomContainer.addChild(roomPin);
        }

        console.log("Added room");

        return roomContainer;
        
    }

    addUserToRoom(user, roomID) {

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
