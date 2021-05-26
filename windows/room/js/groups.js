class Group {
    constructor(config, room) {

        this.capacity = config.capacity ? config.capacity : 1;
        this.position = config.position ? config.position : room.allocateFreePosition();
        this.rotation = config.rotation ? config.rotation : 0;
        this.users = []
        this.id = config.id
        this.room = room

    }

    build(scene) {

        this.pixi.group.position.set(this.position.x, this.position.y)

        //interactivity
        this.pixi.group.interactive = true

        this.pixi.group.on('mousedown', () => {
            this.room.moveUser(myUser, this)
        })

        scene.scene.addChild(this.pixi.group)
    }

    addUser(user) {

        if (this.findUser(user.id)) return
        if (this.capacity == this.users.length) throw new Error('table full')
        this.users.push(user)


        let freeSeat = this.pixi.seats.find(seat => seat.free)
        freeSeat.addChild(user.avatar.getFullBody(false))
        freeSeat.free = false;
        freeSeat.user = user.id;
    }

    removeUser(user) {

        if (!this.findUser(user.id)) return

        this.users.splice(this.users.findIndex(elem => elem.id == user.id), 1)

        let userSeat = this.pixi.seats.find(seat => seat.user == user.id)
        userSeat.removeChildren()
        userSeat.free = true;
        userSeat.user = null;

        if (this.capacity == 0) {
            //do stuff when table is empty
        }

    }

    findUser(id) {
        return this.users.find(user => user.id == id)
    }
}

class TableGroup extends Group {


    constructor(config, room) {

        super(config, room)

        this.rowsDist = config.rowsDist ? config.rowsDist : 40;
        this.seatSize = config.seatSize ? config.seatSize : 80;
        this.id = "table-" + this.id;
    }
    build(scene) {

        this.pixi = {
            group: new PIXI.Container,
            sprite: new PIXI.Sprite(
                app.loader.resources['./assets/table.svg'].texture
            ),
            bottomRow: new PIXI.Container,
            upperRow: new PIXI.Container,
            seats: []
        }

        //upper half
        

        for (var i = 0; i < this.capacity / 2; i++) {

            var seat = new PIXI.Container
            seat.free = true

            this.rotation == 0 ? seat.position.set(0, i * this.seatSize) : seat.position.set(i * this.seatSize, 0);

            this.pixi.seats.push(seat)
            this.pixi.upperRow.addChild(seat)
            
        }

        //table
        

        //lower half
        

        for (var i = 0; i < this.capacity / 2; i++) {
            var seat = new PIXI.Container
            seat.free = true
            this.rotation == 0 ? seat.position.set(0, i * this.seatSize) : seat.position.set(i * this.seatSize,0);
            
            this.pixi.seats.push(seat)
            this.pixi.bottomRow.addChild(seat)
        }


        //layers
        if (this.rotation == 0) {
            this.pixi.group.addChild(this.pixi.sprite)
            this.pixi.group.addChild(this.pixi.upperRow)
            this.pixi.group.addChild(this.pixi.bottomRow)

            this.pixi.upperRow.position.set(-this.seatSize*2, -this.seatSize / 2)
            this.pixi.bottomRow.position.set(this.rowsDist + this.seatSize, -this.seatSize / 2)
        } else {
            this.pixi.group.addChild(this.pixi.upperRow)
            this.pixi.group.addChild(this.pixi.sprite)
            this.pixi.group.addChild(this.pixi.bottomRow)

            this.pixi.upperRow.position.set(-this.seatSize/2, -this.seatSize*2 )
            this.pixi.bottomRow.position.set(-this.seatSize / 2, this.rowsDist + this.seatSize)
        }


        //add to scene
        super.build(scene)

    }
}

class DeskGroup extends TableGroup {

}

class StandingGroup extends Group {

    constructor(config, room) {
        super(config, room)

        this.RADIUS = 100;
        this.capacity = 5;

    }

    build(scene) {

        var _this = this

        this.pixi = {
            group: new PIXI.Container,
            seats: []
        }


        function toCoordinates(angle) {

            return {
                x: _this.RADIUS + _this.RADIUS * Math.cos(angle),
                y: _this.RADIUS + _this.RADIUS * Math.sin(angle)
            }

        }

        for (var i = 0; i < this.capacity ; i++) {
            var seat = new PIXI.Container
            seat.free = true

            let pos = toCoordinates(i / this.capacity * Math.PI)

            seat.position.set(pos.x, pos.y)

            this.pixi.seats.push(seat)

            this.pixi.group.addChild(seat)

        }

        //add to scene
        super.build(scene)

    }
}


class Room {

    constructor(config) {

        this.config = config
        this.id = config.id
        this.MAX_X = config.MAX_X ? config.MAX_X : 1000;
        this.MAX_Y = config.MAX_Y ? config.MAX_Y : 1000;
        this.lobbies = config.lobbies ? config.lobbies : [];

        //background
        this.background = config.background ? config.background : "./assets/marble-tile.png";
      
        //loading objects
        this.objects = {}
        this.objects['tables'] = []
        this.objects['desks'] = []
        this.objects['standing'] = []

        this.loadObjects(config.objects)

        

    }

    loadObjects(objects) {
        //tables
        this.loadTables(objects['tables'])
        this.loadDesks(objects['desks'])
    }

    loadTables(tables) {
        if (tables == undefined) return;

        var _this = this
        tables.forEach((table, i) => {
            _this.addTable(table)
        })
    }

    addTable(config) {

        var table = new TableGroup(config, this)
        this.objects['tables'].push(table)

        return table
    }


    loadDesks(desks) {
        if (desks == undefined) return;

        var _this = this
        desks.forEach((desk, i) => {
            _this.addDesk(desk)
        })
    }

    addDesk(config) {

        var desk = new DeskGroup(config, this)
        this.objects['desks'].push(desk)

        return desk

    }

    addStandingGroup(config) {

        console.log('config for standing: ', config)
        var newGroup = config==null
        if (newGroup) {

            console.log('creating new id')
            
            config = {
                id: myUser._id + "-" + new Date().getTime()
            }
        }

        var group = new StandingGroup(config, this)
        this.objects['standing'].push(group)

        //if (newGroup) {
            group.build(this.scene)
        //}

        return group
    }


    build(scene) {

        var _this = this;

        this.scene = scene;

        scene.background = new PIXI.TilingSprite(
            app.loader.resources['./assets/marble-tile.png'].texture, 3910, 1720
        )

        scene.scene.addChild(scene.background)

        Object.keys(this.objects).forEach((key, i) => {

            _this.objects[key].forEach((obj, i) => {
                obj.build(scene)
            })

        })

        
    }

    allocateFreePosition() {
        var x = 800+Math.floor(Math.random() * this.MAX_X)
        var y = Math.floor(Math.random() * this.MAX_Y)

        return {x:x , y:y}
    }

    moveUser(user, location = null) {
        if (location) {
            user.addToGroup(location.id)
            var oldLocation = this.findObj(null, user.group)
            oldLocation.removeUser(user)
            location.addUser(user)
        }
    }

    removeUser(user) {
        var group = this.findObj(null, user.group);
        user.removeFromGroup()
        group.removeUser(user)
    }

    addUser(user, groupType = null, location = null) {
        if (location) {

           
            var group;

            if (groupType) {
                group = this.findObj(groupType, location)
            } else {
                group = this.findObj(null, location)
            }

            if (!group) {
                var config = {
                    id: location
                }
                group = this.addStandingGroup(config)
                group.build(this.scene)
            }

            user.addToGroup(group.id)
            group.addUser(user)
        } else {

            var config = {
                id: user.id + "-" + new Date().getTime()
            }
            var group = this.addStandingGroup(config)
            group.build(this.scene)
            group.addUser(user)
            user.addToGroup(group.id)
        }
    }

    findObj(group = null, id) {

        if (group) {
            
            return this.objects[group].find(obj => obj.id == id)
        } else {
            for (var type of Object.keys(this.objects)) {
                var g = this.objects[type].find(obj => obj.id == id)
                if (g) {
                    return g
                }
            }
        }
        return null;
    }

    findUser(userId) {
        for (var group of Object.keys(this.objects)) {

            for (var obj of this.objects[group]) {
                var user = obj.findUser(userId);
                if (user) {
                    return user;
                }
            }
        }
    }

    loadUsers(users) {
        var _this = this

        users.forEach((user, i) => {
            // if user in table
            console.log("user is ", user)
            if (user.group != 'NONE') {
                if (user.group.includes('table')) {

                    var table = _this.findObj('tables', user.group)
                    table.addUser(user)

                }
                else if (user.group.includes('desk')) {

                    var desk = _this.findObj('desks', user.group)
                    desk.addUser(user)

                } else {
                    // user in a standing group
                    var group = _this.findObj('standing', user.group)

                    if (!group) {
                        group = _this.addStandingGroup({'id': user.group})
                    }

                    console.log(group)
                    group.addUser(user)
                }
            }
        })
    }
}



let conf = {
    'objects': {

        'tables': [
            { "id": 0, "capacity": 6, "position": { "x": 400, "y": 100 } }, { "id": 1, "capacity": 6, "position": { "x": 400, "y": 500 } }, { "id": 2, "capacity": 6, "position": { "x": 400, "y": 900 } }, { "id": 3, "capacity": 6, "position": { "x": 900, "y": 100 } }, { "id": 4, "capacity": 6, "position": { "x": 900, "y": 500 } }, { "id": 5, "capacity": 6, "position": { "x": 900, "y": 900 } }, { "id": 6, "capacity": 6, "position": { "x": 2000, "y": 100 } }, { "id": 7, "capacity": 6, "position": { "x": 2000, "y": 500 } }, { "id": 8, "capacity": 6, "position": { "x": 2000, "y": 900 } }, { "id": 9, "capacity": 6, "position": { "x": 2500, "y": 100 } }, { "id": 10, "capacity": 6, "position": { "x": 2500, "y": 500 } }, { "id": 11, "capacity": 6, "position": { "x": 2500, "y": 900 } }
        ],
        'desks': [
        ]
    }
}


