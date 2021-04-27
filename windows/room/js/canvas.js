
const PIXI = require('pixi.js')
let avatarsGroup = new PIXI.Container
let app

function createApp() { 
    

    let container = document.querySelector('.room')

    //Create a Pixi Application
    app = new PIXI.Application({
        height: container.getBoundingClientRect().height,
        width: container.getBoundingClientRect().width,
        autoResize: true,
        resolution: devicePixelRatio
    });

    //Add the canvas that Pixi automatically created for you to the HTML document
    container.appendChild(app.view);

    

    //setting the renderer
    app.renderer.backgroundColor = 0xFFFFFF;

    //adding background
    app.loader
        .add(
            [
                './assets/marble-tile.png',
                './assets/table.svg',
                './assets/desk.svg',
            ]
        )
        .load(setup);


    //scene objects

    

    function setup() {

        let background = new PIXI.TilingSprite(
            app.loader.resources['./assets/marble-tile.png'].texture,3910, 1720
        )
        
        let desk = new PIXI.Sprite(
            app.loader.resources['./assets/desk.svg'].texture
        )
        avatarsGroup.position.set(100, 700)
        avatarsGroup.scale.set(0.4)

        let tablePositions = [
            [400, 100],
            [400, 500],
            [400, 900],
            [900, 100],
            [900, 500],
            [900, 900],
            [2000, 100],
            [2000, 500],
            [2000, 900],
            [2500, 100],
            [2500, 500],
            [2500, 900],
        ]

        let deskPositions = [
            [400, 100],
            [400, 320],
            [400, 540],
            [400, 760],
            [400, 980],
            [800, 100],
            [800, 320],
            [800, 540],
            [800, 760],
            [800, 980],
            [1200, 100],
            [1200, 320],
            [1200, 540],
            [1200, 760],
            [1200, 980],
            [1800, 100],
            [1800, 320],
            [1800, 540],
            [1800, 760],
            [1800, 980],
            [1800, 100],
            [1800, 320],
            [1800, 540],
            [1800, 760],
            [1800, 980],
        ]
        

        app.stage.addChild(background)
        app.stage.addChild(avatarsGroup)


        if (roomData['type'] == 'social') {
            for (var pos of tablePositions) {
                let table = new PIXI.Sprite(
                    app.loader.resources['./assets/table.svg'].texture
                )
                table.position.x = pos[0]
                table.position.y = pos[1]
                table.scale.set(1.2)

                app.stage.addChild(table)

            }
        }
        
        if (roomData['type'] == 'study') {
            for (var pos of deskPositions) {
                let table = new PIXI.Sprite(
                    app.loader.resources['./assets/desk.svg'].texture
                )
                table.position.x = pos[0]
                table.position.y = pos[1]
                table.scale.set(1.2)

                app.stage.addChild(table)

            }
        }
        
        function resize() {
            app.renderer.resize(container.getBoundingClientRect().width, document.body.getBoundingClientRect().height)

            let oldHeight = app.stage.height / app.stage.scale.y
            let oldWidth = app.stage.width / app.stage.scale.x
            let width = document.body.getBoundingClientRect().width 
            let height = document.body.getBoundingClientRect().height

            let scaleX = width / oldWidth
            let scaleY = height / oldHeight

            let minScale = Math.max(scaleX, scaleY)


            app.stage.scale.set(minScale)
        }

        //dynamic resize
        window.addEventListener('resize', () => {
            resize()
        })

        resize();
        
        app.ticker.add(delta => update(delta));
        document.dispatchEvent(new Event('canvasReady'))
    }

    function update(delta) {

        
    }

    
}


class Canvas {
//canvas apis that should exist in all canvas
    constructor() {
        this.avatars = {}
        this.groups = {}
        this.positions = []
        this.rows = []

        var spaceY = 200;
        var spaceX = 180;

        for (var i = 0; i < 2; i++) {
            this.rows.push(new PIXI.Container())
            avatarsGroup.addChild(this.rows[i])
            this.positions.push([])
            var _y = i * spaceY;
            for (var j = 0; j < 15; j++) {
                var _x = j * spaceX;
                this.positions[i].push(
                    {
                        free: true,
                        sprite: null,
                        x: _x,
                        y: _y
                    }
                )
            }
        }

        this.rows[1].scale.set(1.1)
        this.rows[0].position.x = 150


    }


//adding avatar
    addToContainer(userId, avatarSprite, group = null) {
        
        for (var i in this.positions) {
            for (var j in this.positions[i]) {
                
                if (this.positions[i][j]['free']) {
                    avatarSprite.position.set(this.positions[i][j]['x'], this.positions[i][j]['y'])
                    this.rows[i].addChild(avatarSprite)
                    this.positions[i][j]['free'] = false
                    this.positions[i][j]['sprite'] = avatarSprite
                    this.positions[i][j]['user'] = userId
                    return
                }
            }
        
    }
}

//removing avatar
    removeFromContainer(avatarSprite) {
    
        for (var i in this.positions) {
           
            for (var j in this.positions[i]) {

                if (!this.positions[i][j]['free'] && this.positions[i][j]['sprite'] == avatarSprite) {
                 this.rows[i].removeChild(avatarSprite)
                 this.positions[i][j]['free'] = true
                 this.positions[i][j]['sprite'] = null
                this.positions[i][j]['user'] = null
             }
                
         }
     }
}

//changing group of avatar
 changeAvatarGroup(avatarID, group) {

}
}