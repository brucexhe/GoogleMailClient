
const { ipcRenderer } = require("electron");
const md5 = require("blueimp-md5");
const JQ = require('jquery')
console.log('calendar.js loaded.');

let MeetList = []

let getMeetList = function(){
    
    for (let i=0;i<10;i++ ){
        let item = JQ('div[role="gridcell"]').find('div[role="presentation"]').find('div[role="button"]:eq('+i+')').text();
         
        if(!item ||item.trim().startsWith('.')){
            continue;
        }

        //newMeet
        //9:30am to 10am, Danone Stand Up Meeting , Bruce He (何小龙), Accepted, No location, October 11, 2022Danone Stand Up Meeting , 9:30am2:30pm to 4:30pm, Test, Bruce He (何小龙), Location: Dadford, Buckingham MK18, UK, October 11, 2022Test2:30 – 4:30pmDadford

        data = item.split(',');
        if(data.length<3){
            continue;
        }
        
        console.log(data);

        let args = {
            'id': md5(data[0]+data[1]+data[2]),
            'time': data[0].replace('to', '-'),
            'title': data[1],
            'user': data[2],
            'show': false
        }

        if(data[2]){
            ipcRenderer.send('newMeet', args);
        }
        
    }
}

//update message per 5s
setInterval(()=>{
    try{
        getMeetList();
    }catch(e){
        console.log(e);
    }
    
}, 10000);