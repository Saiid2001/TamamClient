const PIXI = require('pixi.js');

class GlobalMap {



    constructor(canvas, bg, rooms) {
        
        //bg.addEventListener('load', e => {
        //    console.log("Drawing background.");
        //    this.canvas.drawImage(bg, 0, 0, 2000, 2000 * bg.naturalHeight / bg.naturalWidth);
        //})
        let _this = this;
        rooms.getRooms({ 'open': '' }, (rooms) => {
            _this.rooms = rooms
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

            let foreground = _this.addRooms(_this.rooms);
            app.stage.addChild(foreground);
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

        //function getPos(event) {
        //    var elem = canvas,
        //        elemLeft = elem.getBoundingClientRect().left,
        //        elemTop = elem.getBoundingClientRect().top;
        //    var x = event.pageX - elemLeft,
        //        y = event.pageY - elemTop;

        //    x = x / elem.getBoundingClientRect().width * 2000;
        //    y = y / elem.getBoundingClientRect().height * 2000;
        //    console.log(`x: ${x}, y: ${y}`);

        //    return {x:x, y:y}
        //}
        //canvas.addEventListener('click', event => {

        //    var pos = getPos(event)
        //    _this.onClick({ x: pos.x, y: pos.y })
        //})

        this.app = app;
        this.canvas = canvas;
        this.mapRooms = []
    }

    addRoom(info, position) {
        let _this = this;

        let roomPin = new PIXI.Sprite(_this.app.loader.resources['./assets/map_pin.svg'].texture);
        let scaleFactor = _this.canvas.getBoundingClientRect().width;
        roomPin.x = position.x / 2000 * scaleFactor;
        roomPin.y = position.y / 2000 * scaleFactor;
        roomPin.width = roomPin.texture.baseTexture.realWidth / 2000 * scaleFactor;
        roomPin.height = roomPin.texture.baseTexture.realHeight / 2000 * scaleFactor;
        roomPin.interactive = true;

        let roomContainer = new PIXI.Container();
        roomPin.on('mousedown', () => {
            if (info['name'] == "Main Gate") {

                let r = ipcRenderer.send('go-to', 'lobby')

            } else {

                let r = ipcRenderer.send('go-to-room', info['id'], urlData)

            }
        });

        roomPin.on('mouseover', () => {
            //roomPin.emit('mousedown');
        })

        console.log("Added room");
        roomContainer.addChild(roomPin);
        return roomContainer;


        //this.hitboxes.push(
        //    {
        //        layer: this.buildings[info.name].layer,
        //        hitbox: {
        //            x: position.x,
        //            y: position.y,
        //            w: img.width,
        //            h: img.height
        //        },
        //        click: function () {
        //            if (info['name'] == "Main Gate") {

        //                let r = ipcRenderer.send('go-to', 'lobby')

        //            } else {

        //                let r = ipcRenderer.send('go-to-room', info['id'], urlData)

        //            }
        //        }
        //    }
        //)
        //console.log(this.hitboxes)
        
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
            let roomPin = _this.addRoom({
                'name': room['name'], 
                'id': room['_id']
            },
                //_this.buildings[room['name']]['image'],
                _this.buildings[room['name']]['pos'],
                
            )
            foreground.addChild(roomPin);
        })
        return foreground
    }

    //onClick(position) {

    //    const _this = this;

    //    let hitarea = [];

    //    this.hitboxes.forEach((hitbox, i) => {
    //        if (_this.checkHit(position, hitbox.hitbox)) {
    //            console.log('Clicked hitbox');
    //            hitarea.push(hitbox)
    //        }
    //    })

    //    if (hitarea.length == 0) return

    //    hitarea = hitarea.sort((a, b) => {
    //        if (a.layer < b.layer) {
    //            return 1
    //        } else if (a.layer > b.layer) {
    //            return -1
    //        } else {
    //            return 0
    //        }
    //    }
    //    )

    //    hitarea[0].click(position)
    //}

    //checkHit(position, hitbox) {
    //    return hitbox.x <= position.x && position.x <= hitbox.x + hitbox.w && hitbox.y <= position.y && position.y <= hitbox.y + hitbox.h 
    //}
}
