class CanvasController {

    constructor(canvas) {
        this.canvas = canvas
        this.users = {}
        this.groups = {}
    }

    addAvatar(userData) {
        let userId = userData['_id']
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
    constructor(userID, userData) {
        let avatarData = userData['avatar']
        this.data = avatarData
        this.userID = userID
        this.name = userData['firstName']
        this.cache = {}
    }

    getFullBody(interactive = true) {

        if ( this.cache['full-body'] == undefined ) {
            let sprite = new PIXI.Container()

            let av = PIXI.Sprite.from('../../assets/img/steve.png')
            sprite.addChild(av)

            let nameLabel = new PIXI.Text(this.name, { fontFamily: 'Arial', fontSize: 72, fill: PIXI.Texture.WHITE, align: 'center' });
            const txtBG = new PIXI.Sprite(PIXI.Texture.WHITE);
            txtBG.width = nameLabel.width, txtBG.height = nameLabel.height;

            // cage text
            const nameCage = new PIXI.Container();
            nameCage.addChild(txtBG, nameLabel);


            nameCage.x = 100;
            nameCage.y = -nameCage.height

            if (interactive) {
                sprite.interactive = true
                sprite.on('mousedown', () => {
                    document.dispatchEvent(new CustomEvent('request-call', { detail: { UID: this.userID } }))
                })
                sprite.on('mouseover', () => {
                    
                    sprite.addChild(nameCage)
                    console.log(sprite)

                })
                sprite.on('mouseout', () => {

                    sprite.removeChild(nameCage)

                })
            }

            this.cache['full-body'] = sprite
        }
        

        return this.cache['full-body']
    }

}
