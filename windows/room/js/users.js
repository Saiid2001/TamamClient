const { ipcRenderer } = require("electron");
const { groupD8 } = require("pixi.js");




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

        if(this.group == myUser.group && this.g)

        this.group = "NONE"
    }
}


class MyUser extends User {

    constructor(config){
        super(config)
        this.avatar.onClick = ()=>{};
    }
    
    addToGroup(group) {
        super.addToGroup(group)
        ipcRenderer.send('socketEmit','EnterGroup', {groupId: group.id})
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
        
        ipcRenderer.send('socketEmit','ExitGroup', {groupId: this.group} )
        // close the meeting interface
        myConversationInterface.close()
        this.group = "NONE"

        this.onOut();
        
    }
}