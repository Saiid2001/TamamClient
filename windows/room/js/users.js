



class User {

    constructor(config) {
        this.id = config._id
        this.firstName = config.firstName
        this.lastName = config.lastName
        this.avatar = new Avatar(config._id, config)
        this.group = config.group ? config.group : "NONE";
    }


    addToGroup(id) {
        this.group = id
    }

    removeFromGroup() {
        this.group = "NONE"
    }
}


class MyUser extends User {
    
    addToGroup(id) {
        super.addToGroup(id)
        console.log(id)
        socket.enterGroup(id, error => { console.log(error)})
    }

    removeFromGroup() {
        super.removeFromGroup()
        socket.exitGroup(this.group, error => { console.log(error)})
    }
}