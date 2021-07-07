const PIXI = require('pixi.js');

class GlobalMap {



    constructor(canvas, bg, rooms, users) {

        let _this = this;
        
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

        this.buildings = {
            'BDH': {
                //image: './assets/BDH.svg',
                pos: {
                    x: 1130,
                    y: 583
                },
                layer: 0

            },
            'Jaffet Upper': {
                //image: './assets/Jaffet Upper.svg',
                pos: {
                    x: 1142,
                    y: 740
                },
                layer: 1

            },
            'Jaffet Library': {
                //image: './assets/Jaffet lower.svg',
                pos: {
                    x: 1149,
                    y: 763
                },
                layer:0

            },
            'Main Gate': {
                //image: './assets/MainGate.svg',
                pos: {
                    x: 1120,
                    y: 915
                },
                layer:0

            }
        }

        this.app = app;
        this.canvas = canvas;
        this.mapRooms = []
    }

    addRoom(info, position) {
        let _this = this;
        let scaleFactor = _this.canvas.getBoundingClientRect().width;

        let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
        roomPin.width = roomPin.texture.baseTexture.realWidth / 2000 * scaleFactor;
        roomPin.height = roomPin.texture.baseTexture.realHeight / 2000 * scaleFactor;

        let roomContainer = new PIXI.Container();
        roomContainer.interactive = true;
        roomContainer.buttonMode = true;
        roomContainer.x = position.x / 2000 * scaleFactor;
        roomContainer.y = position.y / 2000 * scaleFactor;
        roomContainer.on('mousedown', () => {
            if (info['name'] == "Main Gate") {

                let r = ipcRenderer.send('go-to', 'lobby')

            } else {

                let r = ipcRenderer.send('go-to-room', info['_id'], urlData)

            }
        });

        console.log(info);

        if (info['users'].length != 0) {
            for (var id of info['users']) {
                let userData = _this.users.find((user) => user['_id'] == id);
                let avatar = new Avatar(id, userData);
                let avatarBody = avatar.getFullBody(true, false);
                avatarBody.position.x = 0;
                avatarBody.position.y = -35;
                avatarBody.scale.set(0.4);
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


        let buildingRooms = roomList.sort((a, b) => {
            if (_this.buildings[a.name].layer < _this.buildings[b.name].layer) {
                return -1
            } else if (_this.buildings[a.name].layer > _this.buildings[b.name].layer) {
                return 1
            } else {
                return 0
            }
        }
        )

        let foreground = new PIXI.Container();
        buildingRooms.forEach((room ,i) => {
            let roomContainer = _this.addRoom(
                room,
                //_this.buildings[room['name']]['image'],
                _this.buildings[room['name']]['pos'],
                
            )
            foreground.addChild(roomContainer);
        })
        return foreground
    }
}
