



class User {

    constructor(config) {
        this.id = config._id
        this.firstName = config.firstName
        this.lastName = config.lastName
        this.avatar = new Avatar(config._id, config)
        this.group = config.group ? config.group : "NONE";
        console.log("config:", config)
    }


    addToGroup(group) {
        this.group = group.id
        this.groupObj = group
    }

    removeFromGroup() {
        this.group = "NONE"
    }
}


class MyUser extends User {
    
    addToGroup(group) {
        super.addToGroup(group)
        socket.enterGroup(group.id, error => { console.log(error) })

        //console.log(0+group.users.length)
        //activating the meeting
        if (group.users.length > 1) {
            // create the meeting interface
            myConversationInterface.open(group.id, group.users, true)
        } else {
            myConversationInterface.close()
        }
    }

    removeFromGroup() {
        super.removeFromGroup()
        socket.exitGroup(this.group, error => { console.log(error)})

        // close the meeting interface
        myConversationInterface.close()
        
    }
}