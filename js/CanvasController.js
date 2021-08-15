
const bitmojiService = require('../../services/bitmoji-service')



class CanvasController {

    constructor(canvas) {
        this.canvas = canvas
        this.users = {}
        this.groups = {}
    }

    addAvatar(userData) {
        let userId = userData['_id']
        if (userId in this.users || userId == User._id) return;
        //we need to construct the avatar
        let avatar = new Avatar(userId, userData)
        
        this.users[userId]= avatar
        this.canvas.addToContainer(userId,avatar.getFullBody())
    }

    removeAvatar(userId) {
        try {
            this.canvas.removeFromContainer(this.users[userId].getFullBody())
            delete this.users[userId]
        } catch (e) {
            console.log(e)
        }
    }


    clear() {
        Object.keys(this.users).forEach((userId, i) => {
            this.canvas.removeFromContainer(this.users[userId].getFullBody())
        })
        this.users = {}
    }
}


class Avatar{

    static VARIANTS = {
        0: 'user_0.png',
        1: 'user_1.png'
    }

    constructor(userID, userData) {
        let avatarData = userData['avatar'] 
        this.data = avatarData
        this.userID = userID
        this.gender = userData.gender
        this.name = userData['firstName']
        this.cache = {}
        this.onHover = ()=>{}
        this.onMouseOut = ()=>{}
        this.onClick = ()=>{}
    }

    getFullBodyURL(){
        return bitmojiService.getAvatarImage(this.data, this.gender,'body' )
    }

    getFullBody(interactive = true, withusername = true) {
        const PIXI = require("pixi.js");

        if ( this.cache['full-body'] == undefined ) {
            let sprite = new PIXI.Container()

            let _this = this;
            let av = PIXI.Sprite.from(this.getFullBodyURL())
            av.scale.set(0.8,0.8)
            av.position.x = -50
            av.position.y = 0
            sprite.addChild(av)
            sprite.width  = av.width
            sprite.position.set(50, 0)

            if (withusername) {
                let nameLabel, txtBG;

                txtBG = new PIXI.Sprite(PIXI.Texture.WHITE);

                if (this.userID == myUser.id) {
                    nameLabel = new PIXI.Text("You", { fontFamily: 'Arial', fontSize: 72, fill: 0xffffff, align: 'center' });
                    txtBG.tint = 0x00B494;
                } else {
                    nameLabel = new PIXI.Text(this.name, { fontFamily: 'Arial', fontSize: 72, fill: 0x00B494, align: 'center' });
                    txtBG.tint = 0xbbbbbb;
                }

            if(this.userID == myUser.id){
                nameLabel= new PIXI.Text("You", { fontFamily: 'Arial', fontSize: 72, fill: 0xffffff, align: 'center' });
                txtBG.tint = 0x00B494;
            }else{
                nameLabel= new PIXI.Text(this.name, { fontFamily: 'Arial', fontSize: 72, fill: 0xffffff, align: 'center' });
                txtBG.tint = 0x0082AA;
            }
            
            txtBG.width = nameLabel.width+50, txtBG.height = nameLabel.height;

            const nameCage = new PIXI.Container();
            nameCage.addChild(txtBG, nameLabel)

                nameCage.x = 0;
                nameCage.y = -nameCage.height / 2
                nameCage.scale.set(0.5, 0.5)

                nameLabel.position.x = txtBG.width / 2 - nameLabel.width / 2;

                sprite.addChild(nameCage)
            }
            // if (interactive) {
            //     sprite.interactive = true
            //     // sprite.on('mousedown', () => {
            //     //     document.dispatchEvent(new CustomEvent('request-call', { detail: { UID: this.userID } }))
            //     // })
                sprite.interactive=true
                //  sprite.on('mouseover', () => {
                //      _this.onHover();

                //  })
                //  sprite.on('mouseout', () => {

                //      _this.onMouseOut();

                //  })

                sprite.on('click', ()=>{
                    _this.onClick();
                })
            // }

            this.cache['full-body'] = sprite
        }
        

        return this.cache['full-body']
    }

    getFaceURL(){
        return bitmojiService.getAvatarImage(this.data, this.gender,'face' )
    }

    getFace() {
        const PIXI = require("pixi.js");

        if ( this.cache['full-body'] == undefined ) {
            let sprite = new PIXI.Container()

            let av = PIXI.Sprite.from(this.getFaceURL())
            av.scale.set(0.8,0.8)
            av.position.x = 0
            av.position.y = 0
            sprite.addChild(av)
            sprite.width  = av.width
            sprite.position.set(50, 0)

            this.cache['full-body'] = sprite
        }
        

        return this.cache['full-body']
    }

}

