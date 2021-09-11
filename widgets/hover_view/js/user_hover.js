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

        //if(user.id == myUser.id) return;
        var container = document.getElementById('user-hover-view')

        container.style.top = position.y+"px";
        container.style.left = position.x+"px";

        UserHoverView._fillBasicInfo(user)
        userService.getMutualFriends(user.id,UserHoverView._fillFriendsInfo)
        userService.getLastInteraction(user.id, UserHoverView._fillInteractionInfo)

        container.removeAttribute('hidden')
        UserHoverView.isVisible =true;
        setTimeout(
            ()=>{window.addEventListener('click', UserHoverView._checkOutMouse)}
            , 200)

        container.querySelector('.cta').addEventListener('click', () => {
            UserHoverView.sendRequest(user);
        })


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
        container.querySelector('.profileImage img').src = data.avatar.getHeadUrl();

        let major = UserHoverView.MAJORS[data.major]
        let standing = UserHoverView.STANDINGS[(new Date()).getFullYear() - data.enrollY]
        if(!standing) standing="Senior";

        container.querySelector('.major').innerHTML = major;
        container.querySelector('.standing').innerHTML = standing;
        container.querySelector('.major-summary').innerHTML = standing+ " in "+major;
    },
    _fillFriendsInfo: function (data){
        var container = document.getElementById('user-hover-view')
        if(data.length == 0){
            container.querySelector('[data-section="friends"] .bubbles').innerHTML = `No mutual friends`;
            container.querySelector('[data-section="friends"] .summary em').innerHTML = 'No';
            return;
        }
        container.querySelector('[data-section="friends"] .bubbles').innerHTML = `<button class="bubble round">
        ...
    </button>`;

        
        function _addFriendBtn(friendData, hidden= false){
            let template = `
                <div class="profileImage round">
                    <img src="${(new User(friendData)).avatar.getFaceURL()}" alt="" >
                </div>
                <small>${friendData.firstName}</small>
                <div class="online"></div>
            `;

            let obj = document.createElement('div')
            obj.className='bubble user-bubble'
            obj.innerHTML = template

            if(hidden){
                obj.setAttribute('hidden','')
            }
            container.querySelector('[data-section="friends"]').appendChild(obj)
        }
        let num = 0;
        data.forEach(friend => {

            if(num<5){
                _addFriendBtn(friend)
            }else{
                _addFriendBtn(friend, true)
            }
            num++;
        });

        container.querySelector('[data-section="friends"] button').onclick = toggleViewMore
        
        var viewMore = false
        function toggleViewMore(){
            viewMore = !viewMore

            if(viewMore){
                container.querySelectorAll('[data-section="friends"] .user-bubble').forEach(elem=>elem.removeAttribute('hidden'))
            }else{


                container.querySelectorAll('[data-section="friends"] .user-bubble').forEach((elem,i)=>{
                    if(i>=5){
                        elem.setAttribute('hidden','')
                    }
                })
            }
        }

        //summary
        container.querySelector('[data-section="friends"] .summary em').innerHTML = data.length;
    },
    _fillInterestsInfo: function (data){},
    _fillInteractionInfo: function (data){
       
        var row = document.querySelector('#user-hover-view [data-section="interaction"]')
        if(!('date' in data)){
            row.setAttribute('hidden',"")
            return;
        }
        row.removeAttribute('hidden')
        var container = document.getElementById('user-hover-view')
            container.querySelector('[data-section="interaction"] em').innerHTML= fuzzyDuration(data.secondsSinceToday)
            container.querySelector('[data-section="interaction"] a').innerHTML= data.room.name
            
    },


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
     

    sendRequest: function(user){
        //add the script here to send request
        userService.sendFriendRequest(user.id, () => {
            console.log("sent request");
        })

        var container = document.getElementById('user-hover-view')
        container.querySelector('.cta').setAttribute('hidden', '')
    }





}

function fuzzyDuration(secs){

    if(secs<60)
        return "Now"
    if(secs<60*60)
        return Math.floor(secs/60) + " minutes ago"
    if(secs<60*60*24)
        return Math.floor(secs/60/60) + ' hours ago'
    if(secs<60*60*24*7)
    {
        let days= Math.floor(secs/(60*60*24))
        if(days ==1)
            return 'yesterday'
        return days+ " days ago"
    }
        
    if(secs<60*60*24*7*4)
        return Math.floor(secs/(60*60*24*7))+ " weeks ago"
    if(secs<60*60*24*7*4*12)
        return Math.floor(secs/(60*60*24*7*4))+ " months ago"

    return Math.floor(secs/(60*60*24*7*4*12))+ " years ago"
    



}

