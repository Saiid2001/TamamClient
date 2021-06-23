

class GlobalMap {



    constructor(canvas, bg) {
        this.canvas = canvas.getContext('2d');
        //var bg = new Image;
        //bg.src = background_path;
        bg.addEventListener('load', e => {
            console.log("Drawing background.");
            this.canvas.drawImage(bg, 0, 0, 2000, 2000 * bg.naturalHeight / bg.naturalWidth);
        })
        

        this.buildings = {
            'BDH': {
                image: './assets/BDH.svg',
                pos: {
                    x: 1360,
                    y: 790
                },
                layer: 0

            },
            'Jaffet Upper': {
                image: './assets/Jaffet Upper.svg',
                pos: {
                    x: 1102,
                    y: 740
                },
                layer: 1

            },
            'Jaffet Library': {
                image: './assets/Jaffet lower.svg',
                pos: {
                    x: 1109,
                    y: 763
                },
                layer:0

            },
            'Main Gate': {
                image: './assets/MainGate.svg',
                pos: {
                    x: 1089,
                    y: 1121
                },
                layer:0

            }
        }
        const _this = this

        function getPos(event) {
            var elem = canvas,
                elemLeft = elem.getBoundingClientRect().left,
                elemTop = elem.getBoundingClientRect().top;
            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

            x = x / elem.getBoundingClientRect().width * 2000;
            y = y / elem.getBoundingClientRect().height * 2000;

            return {x:x, y:y}
        }
        canvas.addEventListener('click', event => {

            var pos = getPos(event)
            _this.onClick({ x: pos.x, y: pos.y })
        })

        this.hitboxes = []
    }

    addRoom(info, image, position) {
        var img = new Image;
        img.src = image;
        this.canvas.drawImage(img, position.x, position.y)



        this.hitboxes.push(
            {
                layer: this.buildings[info.name].layer,
                hitbox: {
                    x: position.x,
                    y: position.y,
                    w: img.width,
                    h: img.height
                },
                click: function () {
                    if (info['name'] == "Main Gate") {
                        
                        let r = ipcRenderer.send('go-to', 'lobby')
                        
                    } else {
                        
                        let r = ipcRenderer.send('go-to-room', info['id'], urlData)
                        
                    }
                }
            }
        )
        console.log(this.hitboxes)
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

        buildingRooms.forEach((room ,i) => {
            _this.addRoom({
                'name': room['name'], 
                'id': room['_id']
            },
                _this.buildings[room['name']]['image'],
                _this.buildings[room['name']]['pos']
            )
        })
    }

    onClick(position) {

        const _this = this;

        let hitarea = [];

        this.hitboxes.forEach((hitbox, i) => {
            if (_this.checkHit(position, hitbox.hitbox)) {
                hitarea.push(hitbox)
            }
        })

        if (hitarea.length == 0) return

        hitarea = hitarea.sort((a, b) => {
            if (a.layer < b.layer) {
                return 1
            } else if (a.layer > b.layer) {
                return -1
            } else {
                return 0
            }
        }
        )

        hitarea[0].click(position)
    }

    checkHit(position, hitbox) {
        return hitbox.x <= position.x && position.x <= hitbox.x + hitbox.w && hitbox.y <= position.y && position.y <= hitbox.y + hitbox.h 
    }
}
