



class User {

    constructor(config) {
        this.id = config._id
        this.firstName = config.firstName
        this.lastName = config.lastName
        this.avatar = new Avatar(config._id, config)
        this.group = config.group ? config.group : "NONE";
        this.major = config.major;
        this.enrollY = config.enrollY;
        this.gradY = config.gradY;
        console.log("config:", config)

        var _this = this

        this.avatar.onClick = ()=>{
            UserHoverView.show(UserHoverView._getBestPosition(),_this)
        }

        this.onOut = ()=>{
            UserHoverView.hide();
        }

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

        if (myConversationInterface.isOpen) myConversationInterface.close()
        if (group.users.length > 1) {
            // create the meeting interface
            myConversationInterface.open(group.id, group.users, true)
        } else {
            myConversationInterface.close()
        }

        this.onOut();
    }

    removeFromGroup() {
        super.removeFromGroup()
        socket.exitGroup(this.group, error => { console.log(error)})

        // close the meeting interface
        myConversationInterface.close()

        this.onOut();
        
    }
}