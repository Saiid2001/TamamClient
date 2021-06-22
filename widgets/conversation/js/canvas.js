//const require = parent.require;

//if (!PIXI) {
 //   const PIXI = require('pixi.js')
 //   let avatarsGroup = new PIXI.Container();
 //   let app
//}


document.addEventListener('nothing', () => { 
    

    let container = document.querySelector('.users .avatars')

    //Create a Pixi Application
    app = new PIXI.Application({
        height: container.getBoundingClientRect().height,
        width: container.getBoundingClientRect().width,
        autoResize: true,
        resolution: devicePixelRatio,
        transparent: true
    });

    //Add the canvas that Pixi automatically created for you to the HTML document
    container.appendChild(app.view);

  
    //setting the renderer
    

    //adding background
    app.loader
        .add(
            [
                '../../assets/img/avatar.png'
            ]
        )
        .load(setup);


    //scene objects

  
    

    function setup() {
        

        avatarsGroup.position.set(100, 700)
        avatarsGroup.scale.set(0.4)

        app.stage.addChild(avatarsGroup)
        

        

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
        
    }

    parent.document.addEventListener('request-call', e => {
        console.log('calling')
    })

    
})

/*class Canvas {
//canvas apis that should exist in all canvas
    constructor() {
        this.avatars = {}
        this.groups = {}
        this.positions = []
        this.rows = []

        var spaceY = 200;
        var spaceX = 180;

        for (var i = 0; i < 1; i++) {
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

*/


class VideoScreensHandler {
    static video_feeds = {}

    static addVideoFeed(userID) {
        let feed = new VideoFeed(userID);
    }

    static removeVideoFeed(userID) {

    }
}


class VideoFeed {
    constructor(userID) {

    }
}