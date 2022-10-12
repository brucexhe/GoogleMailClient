
const { ipcRenderer } = require("electron");
const moment = require('moment')
const md5 = require("blueimp-md5");
const $ = require('jquery')
console.log('mail.js loaded.');

let badgeCount = 0;

//updateBadgeCount
let updateBadgeCount = function(){

    let txt = $('div[role="navigation"]').find('span:eq(0)').text();
    if(txt==''){
        txt = '0'
    }
    console.log('newBadgeCount:'+txt);
    console.log('oldBadgeCount:'+badgeCount);

    newBadgeCount = parseInt(txt);

    //newMail
    if(newBadgeCount != badgeCount){
        newMail();
    }

    badgeCount = newBadgeCount;

    ipcRenderer.send('badgeCount', badgeCount);
} 
let newMail = function(){
    for (let i=0;i<50;i++){
        try{

            let tr = $('table[role="grid"]').find('tr:eq('+i+')');
            let fontWeight = tr.find('td:eq(3)').find('div:eq(1)').find('span:eq(1)').css('font-weight');
            //console.log(fontWeight);
            if (fontWeight == '700') {
                let title = tr.find('td:eq(3)').find('div:eq(1)').text();
                let body = tr.find('td:eq(4)').find('div:eq(0)').text();
                let time= tr.find('td:eq(7)').find('span:eq(0)').attr('title');
                console.log('time:' +time);
                var mtime = moment(time).format('YYYY-MM-DD hh:mm');
                args = {
                    'id': md5(title+body+time),
                    'title': title,
                    'body': body,
                    'time': mtime
                }
                ipcRenderer.send('newMail', args);
            }
        }catch(e){
            console.log(e);
        }
        
        
    }
    
}


//update message per 5s
setInterval(()=>{
    try{
        updateBadgeCount();
    }catch(e){
        console.log(e);
    }
    
}, 10000);



