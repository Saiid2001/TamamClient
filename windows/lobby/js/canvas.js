
const PIXI = require('pixi.js')
let avatarsGroup = new PIXI.Container();
let app

document.addEventListener('DOMContentLoaded', () => { 
    

    let container = document.querySelector('.lobby')

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
                './assets/img/background.png',
                './assets/img/background-ground.png',
                './assets/img/cloud1.svg',
                './assets/img/cloud2.svg',
                './assets/img/green.svg',
                './assets/img/forground.png'
            ]
        )
        .load(setup);


    //scene objects
    let cloudsGroup = new PIXI.Container();

    function randomInt(max, min) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function addRandomCloud() {
        clouds = [
            app.loader.resources['./assets/img/cloud1.svg'].texture,
            app.loader.resources['./assets/img/cloud2.svg'].texture
        ]
        var numClouds = clouds.length
        let i = randomInt(numClouds, 0)
        var cloud = new PIXI.Sprite(clouds[i])

        var y = randomInt(container.getBoundingClientRect().height / 2, 0)
        var x = randomInt(-cloud.width, -container.getBoundingClientRect().width)
        var scale = Math.random() / 2 + 0.5
        
        cloud.position.set(x, y)
        cloud.scale.set(scale)
        cloud.alpha = scale-0.3;
        cloudsGroup.addChild(cloud)

    }

    

    function setup() {
        let background = new PIXI.Sprite(
            app.loader.resources['./assets/img/background.png'].texture
        );

        let green = new PIXI.Sprite(
            app.loader.resources['./assets/img/background-ground.png'].texture
        )
        green.y = 0;
        green.x = 0;
        

        let forground = new PIXI.Sprite(
            app.loader.resources['./assets/img/forground.png'].texture
        )
        forground.y = 1200

        avatarsGroup.position.set(100, 700)
        avatarsGroup.scale.set(0.4)

        green.scale.set(0.5)
        app.stage.addChild(background)
        app.stage.addChild(cloudsGroup)
        app.stage.addChild(green)
        app.stage.addChild(avatarsGroup)
        app.stage.addChild(forground)
        

        for (var i = 0; i < 7; i++) {
            addRandomCloud()
        }

        function resize() {
            app.renderer.resize(container.getBoundingClientRect().width, document.body.getBoundingClientRect().height)

            let oldHeight = app.stage.height / app.stage.scale.y
            let oldWidth = app.stage.width / app.stage.scale.x
            let width = document.body.getBoundingClientRect().width * 0.75
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

        //updating clouds
        for (var cloud of cloudsGroup.children) {
            cloud.x += 1 / cloud.scale.x
            if (cloud.x > container.getBoundingClientRect().width / 2 && cloudsGroup.children.length<=7) {
                
                addRandomCloud();
            }
            if (cloud.x/app.stage.scale.x > app.stage.width) {
                cloudsGroup.removeChild(cloud)
            }
        }
    }

    
})


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