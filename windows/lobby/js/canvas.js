
    const PIXI = require('pixi.js')

    let container = document.querySelector('.lobby')

    //Create a Pixi Application
    let app = new PIXI.Application({
        height: container.getBoundingClientRect().height,
        width: container.getBoundingClientRect().width,
        autoResize: true,
        resolution: devicePixelRatio
    });

    //Add the canvas that Pixi automatically created for you to the HTML document
    container.appendChild(app.view);

    //dynamic resize
    window.addEventListener('resize', () => {
        app.renderer.resize(container.getBoundingClientRect().width, container.getBoundingClientRect().height)
        
    })

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
    let avatarsGroup = new PIXI.Container();

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
        green.y = app.renderer.height  - green.height/2;
        green.x = 0;
        

        let forground = new PIXI.Sprite(
            app.loader.resources['./assets/img/forground.png'].texture
        )
        forground.y = app.renderer.height - forground.height

        avatarsGroup.position.set(50, app.renderer.height - 400)

        green.scale.set(0.5)
        app.stage.addChild(background)
        app.stage.addChild(cloudsGroup)
        app.stage.addChild(green)
        app.stage.addChild(avatarsGroup)
        app.stage.addChild(forground)
        

        for (var i = 0; i < 7; i++) {
            addRandomCloud()
        }
        
        app.ticker.add(delta => update(delta));

    }

    function update(delta) {

        //updating clouds
        for (var cloud of cloudsGroup.children) {
            cloud.x += 1 / cloud.scale.x
            if (cloud.x > container.getBoundingClientRect().width / 2 && cloudsGroup.children.length<=7) {
                
                addRandomCloud();
            }
            if (cloud.x > container.getBoundingClientRect().width) {
                cloudsGroup.removeChild(cloud)
            }
        }
    }


class Canvas {
//canvas apis that should exist in all canvas
    constructor() {
        this.avatars = {}
        this.groups = {}
        this.positions = {}

    }


//adding avatar
    addToContainer(avatarSprite, group = null) {
        
    avatarSprite.scale.set(0.3);
    let len = Object.keys(this.positions).length
    
    if (len == 0) {
        this.positions[0] = {
            sprite: avatarSprite,
            free: true,
            x: 0,
            y: 0
        }

        
    }

    for (var i of Object.keys(this.positions)) {
        if (this.positions[i]['free']) {
            avatarSprite.position.set(this.positions[i]['x'], this.positions[i]['y'])
            avatarsGroup.addChild(avatarSprite)
            this.positions[i]['free'] = false
            return
        }
    }


    if (len < 20) {
        
        this.positions[len] = {
            sprite: avatarSprite,
            free: false,
            x: this.positions[len - 1]['x'] + avatarSprite.width,
            y: 0
        }
        avatarSprite.position.set(this.positions[len]['x'], this.positions[len]['y'])
        avatarsGroup.addChild(avatarSprite)
    }

    
}

//removing avatar
 removeFromContainer(avatarSprite) {

}

//changing group of avatar
 changeAvatarGroup(avatarID, group) {

}
}