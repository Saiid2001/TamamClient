const { proxy } = require('jquery');
const userService = require('../../services/user-service')

const UserHoverView = {


    isVisible: false,
    mousePos:{x:0, y:0},

    MAJORS:{
        'CCE': "Computer Communication Engineering"
    },

    STANDINGS:{
        0: "Sophomore",
        1: "Junior",
        2: "Junior",
    },

    init:function(){

        var container = document.querySelector('#user-hover-view')

        document.querySelector('#user-hover-view footer').addEventListener('click', ()=>{
            container.classList.toggle('compact')
        })

        window.addEventListener('mousemove', UserHoverView._trackMouseMovement)
        

    },
    _checkOutMouse(e){
        console.log('click to out')
        var container = document.querySelector('#user-hover-view')
        var x = container.getBoundingClientRect().x;
        var y = container.getBoundingClientRect().y;
        var w = container.getBoundingClientRect().width;
        var h = container.getBoundingClientRect().height;
        if(UserHoverView.isVisible && (e.clientX<= x ||e.clientX>= x+w) || (e.clientY<=y || e.clientY>=y+h)){
            UserHoverView.hide();
        }
    },
    show: function (
        position,
        user
    ){

        if(user.id == myUser.id) return;
        var container = document.getElementById('user-hover-view')

        container.style.top = position.y+"px";
        container.style.left = position.x+"px";

        UserHoverView._fillBasicInfo(user)

        container.removeAttribute('hidden')
        UserHoverView.isVisible =true;
        setTimeout(
            ()=>{window.addEventListener('click', UserHoverView._checkOutMouse)}
            ,200)


    },
    hide: function (

    ){

        document.getElementById('user-hover-view').setAttribute('hidden','')
        UserHoverView.isVisible =false;
        window.removeEventListener('click', UserHoverView._checkOutMouse)
    },

    _fillBasicInfo: function (data){

        var container = document.getElementById('user-hover-view')
        container.querySelector('.firstName').innerHTML = data.firstName;
        container.querySelector('.lastName').innerHTML = data.lastName;
        container.querySelector('.profileImage img').src = data.avatar.getFaceURL();

        let major = UserHoverView.MAJORS[data.major]
        let standing = UserHoverView.STANDINGS[(new Date()).getFullYear() - data.enrollY]
        if(!standing) standing="Senior";

        container.querySelector('.major').innerHTML = major;
        container.querySelector('.standing').innerHTML = standing;
        container.querySelector('.major-summary').innerHTML = standing+ " in "+major;


    },
    _fillFriendsInfo: function (data){},
    _fillInterestsInfo: function (data){},
    _fillInteractionInfo: function (data){},


    startHover(user){

        let isOnAvatar = true;

        user.avatar.onMouseOut = ()=>{
            isOnAvatar = false;
            UserHoverView.endHover(user);
        }
        setTimeout( ()=>{

            if(isOnAvatar && !UserHoverView.isVisible){

                UserHoverView.show(
                    UserHoverView._getBestPosition(),
                    user
                )

                window.removeEventListener('mousemove', UserHoverView._trackMouseMovement)
            }
        }
        ,1000);
    },

    endHover(user){

        window.removeEventListener('mousemove', UserHoverView._trackMouseMovement)

        let isOnView = false;

        document.getElementById('user-hover-view').addEventListener('mouseover',()=>{isOnView=true});
        document.getElementById('user-hover-view').addEventListener('mouseout',()=>{isOnView=false
            UserHoverView.endHover(user);
        });
    
        let isOnAvatar = false;
        user.avatar.onHover = ()=>{isOnAvatar = true};
        user.avatar.onMouseOut = ()=>{isOnAvatar = false
            UserHoverView.endHover(user);
        };

        setTimeout(()=>{
            if(!isOnAvatar && !isOnView){
                UserHoverView.hide()
                user.avatar.onHover = ()=>{UserHoverView.startHover(user)}
            }
        }
            ,1000
        )
    },

    _trackMouseMovement(e){
        UserHoverView.mousePos.x = e.clientX;
        UserHoverView.mousePos.y = e.clientY;
    },

    _getBestPosition(){

        var container = document.getElementById('user-hover-view')

        var bottom = UserHoverView.mousePos.y+ 160;
        var top = UserHoverView.mousePos.y-160;

        var mx = UserHoverView.mousePos.x;

        var pos = {}
        if(top<0){
            pos= {x: mx-250 ,y: 0}
        }
        else if(bottom>window.innerHeight){
            pos= {x: mx-250 ,y: window.innerHeight-320}
        }
        else{
            pos= {x: mx-250 ,y: top}
        }

        if(pos.x<0){
            pos.x = 20;
        }
        
        return pos
    },
     

    sendRequest: function(){
        //add the script here to send request

        var container = document.getElementById('user-hover-view')
        container.querySelector('.cta').setAttribute('hidden', '')
    }





}

