
var current_notifications = {}


function showNotification(
    message, 
    actions = {
        'confirm': null,
        'cancel': null
    },
    id
)
{

    hideNotification(id);

    current_notifications[id] = document.createElement('div')
    current_notifications[id].className = 'notification'
    current_notifications[id].innerHTML = `
    
            <p>
                ${message}
            </p>
    `;

    /*<button class='confirm'>
                <img src="../../assets/img/confirm.png" />
            </button>
            <button class='cancel'>
                <img src="../../assets/img/cancel.png" />
            </button> */

    document.querySelector('.notification-collection').appendChild(current_notifications[id])

    if('confirm' in actions && actions['confirm'] != null){
        var btn_confirm = document.createElement('button')
        btn_confirm.innerHTML = '<img src="../../assets/img/confirm.png" />'
        current_notifications[id].appendChild(btn_confirm)
        btn_confirm.onclick = actions['confirm']
    }

    if('cancel' in actions && actions['cancel'] != null){
        var btn_cancel = document.createElement('button')
        btn_cancel.innerHTML = '<img src="../../assets/img/cancel.png" />'
        current_notifications[id].appendChild(btn_cancel)
        btn_cancel.onclick = actions['cancel']
    }

}

function hideNotification(id = null){

    if(id){

        if(id in current_notifications){
            current_notifications[id].parentElement.removeChild(current_notifications[id])
            delete current_notifications[id]
        }
    
    }else{
        for(var id of Object.keys(current_notifications)){
            current_notifications[id].parentElement.removeChild(current_notifications[id])
            delete current_notifications[id]
        }
    }
}