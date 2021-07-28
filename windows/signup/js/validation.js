const VALIDATORS = {
    'not_empty': function(field){
        return !(field.value == '' || field.value == null || field.value == undefined || field.value == ' ')
    },
    'email': function (field) 
    {
     if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(field.value))
      {
        return (true)
      }
        return (false)
    }
}


function checkField(field, validators){

for(var val of validators){
    var res = VALIDATORS[val](field);
    if(!res) return {result: false, source: val};
}

return {result: true}
    
}

function checkForm(form){
    for(var fieldGroup of form){
        var res = checkField(fieldGroup.field, fieldGroup.validators)
        
        if(!res.result) return {result: false, source: {field: fieldGroup.field.getAttribute('name'), condition: res.source}};
    }

    return {result: true}
}