class CanvasController {

    constructor(canvas) {
        this.canvas = canvas
        this.users = {}
        this.groups = {}
    }

    addAvatar(userData) {
        let userId = userData['id']
        //we need to construct the avatar
        let avatar = new Avatar(userId, userData['avatar'])
        this.users[userId]= avatar
        this.canvas.addToContainer(userId,avatar.getFullBody())
    }

    removeAvatar(userId) {

    }

    clear() {
        Object.keys(this.users).forEach((userId, i) => {
            this.canvas.removeFromContainer(this.users[userId].getFullBody())
        })
        this.users = {}
    }

    

    

}


class Avatar{
    constructor(userID, avatarData) {
        this.data = avatarData
        this.userID = userID
        this.cache = {}
    }

    getFullBody(interactive = true) {
        if ( this.cache['full-body'] == undefined ) {
            let sprite = new PIXI.Container()
            sprite.addChild(PIXI.Sprite.from('../../assets/img/steve.png'))

            if (interactive) {
                sprite.interactive = true
                sprite.on('mousedown', () => {
                    document.dispatchEvent(new CustomEvent('request-call', { detail: { UID: this.userID } }))
                })
            }

            this.cache['full-body'] = sprite
        }
        

        return this.cache['full-body']
    }

}
