class CanvasController {

    constructor(canvas) {
        this.canvas = canvas
        this.users = {}
        this.groups = {}
    }

    addAvatar(userData) {
        let userId = userData['id']
        //we need to construct the avatar
        let avatar = CanvasController.buildAvatar(userData['avatar'])
        this.users[userId]= avatar
        this.canvas.addToContainer(avatar)
    }

    removeAvatar(userId) {

    }

    static buildAvatar(avatarData) {
        let img = document.createElement('img')
        img.src = '../../assets/img/steve.png'

        let base = new PIXI.BaseTexture(img)
        let resource = new PIXI.Texture(base)

        return new PIXI.Sprite(resource)
    }

}
