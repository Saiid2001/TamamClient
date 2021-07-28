function showCard(cardId){
    var toShow = document.getElementById(cardId);
    var visible = document.querySelector('.cards .card:not(.card-next):not(.card-done)')

    if(toShow.classList.contains('card-next')){

        toShow.classList.remove('card-next');
        visible.classList.add('card-done');

    }
}

function updateLoading(stage){

    var i = 0;

    document.querySelectorAll('#loading .step').forEach(elem=>{
        elem.classList.remove('done');
        if(i<stage){
            elem.classList.add('done');
        }
        i++;
    })
}