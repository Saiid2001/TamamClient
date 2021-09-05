

class Schedule{

    static COLORS = [
        'var(--dark-main-green)',
        'var(--main-blue)',
        '#6b0d0b',
        '#c10909',
        '#680992',
        '#f4511e',
        '#e67673',
        'var(--main-green)',
        '#a9a9a9'
    ]
    
    static buildView(container, classes){

        var classesContainer = container.querySelector('.classes');
        classesContainer.innerHTML = ""
        

        function _addClass(classData, colorIndex){

            function _addBlock(dayIndex, startTime, endTime){
                let elem = document.createElement('div')
                elem.className = 'class';
                elem.id = classData.CRN;
                elem.innerHTML = `
                <h1>${classData.SUBJECT+" "+classData.CODE}</h1>
                <small>${startTime[0]}:${startTime[1]} - ${endTime[0]}:${endTime[1]} </small>
                `;

                elem.style.left = dayIndex*20+"%";
                elem.style.backgroundColor = Schedule.COLORS[colorIndex]
                console.log(Schedule.COLORS[colorIndex])
                
                //time
                let st = startTime[0]+startTime[1]/60.0;
                let et = endTime[0]+endTime[1]/60.0;

                console.log(st)
                elem.style.top = ((st-7)/13 )*100 +"%";
                elem.style.height = (et-st)/13*100+"%";

                classesContainer.appendChild(elem);
            }

            for (let i = 0; i < classData.S1_DAYS.length; i++) {
                
                if(classData.S1_DAYS[i]){
                    _addBlock(i, classData.S1_START, classData.S1_END)
                }
                
            }

            for (let i = 0; i < classData.S2_DAYS.length; i++) {
                
                if(classData.S2_DAYS[i]){
                    _addBlock(i, classData.S2_START, classData.S2_END)
                }
                
            }

            
        }
        classes.forEach((classData,i) => {
            _addClass(classData,i)
        });
    }

    static fillInputArea(container, classes){
        var crnBoxes= container.querySelectorAll('input')

        classes.forEach((classData,i)=>{

            crnBoxes[i].value = classData.CRN
        })
    }

    static activateInputArea(container, onSubmit){
        var crnBoxes= container.querySelectorAll('input')
        var submitButton = container.querySelector('button')

        function submit(){
            let crns = []
            crnBoxes.forEach(box=>{
                if(box.value.length == 5)
                    crns.push(box.value)
            })
            onSubmit(crns)
        }

        submitButton.addEventListener('click', submit)
    }
    
}

