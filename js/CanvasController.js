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
        this.canvas.addToContainer(avatar.getFullBody())
    }

    removeAvatar(userId) {

    }

    

}


class Avatar{
    constructor(userID, avatarData) {
        this.data = avatarData
        this.userID = userID
    }

    getFullBody(interactive = true) {
        let sprite = new PIXI.Container()
        sprite.addChild(PIXI.Sprite.from('../../assets/img/steve.png'))

        if (interactive) {
            sprite.interactive = true
            sprite.on('mousedown', () => {
                document.dispatchEvent(new CustomEvent('request-call', { detail: {UID: this.userID }}))
            })
        }

        return sprite
    }

}
