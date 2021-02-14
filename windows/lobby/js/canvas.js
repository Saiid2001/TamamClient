
document.addEventListener('DOMContentLoaded', () => {
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
                './assets/img/cloud1.svg',
                './assets/img/cloud2.svg',
                './assets/img/green.svg',
            ]
        )
        .load(setup);


    //scene objects
    let cloudsGroup = new PIXI.Container();
    let cloudSprites = []

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
            app.loader.resources['./assets/img/green.svg'].texture
        )
        green.y = 300;
        green.x = 80;

        green.scale.set(0.8)
        app.stage.addChild(background)
        app.stage.addChild(cloudsGroup)
        //app.stage.addChild(green)

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



})
