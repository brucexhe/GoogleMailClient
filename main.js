// app对象用于控制electron的生命周期事件
// BrowserWindow用于初始化窗口，返回一个窗口对象，与vue对象类似

const { app , shell, Menu, Tray, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require('path')
const fs = require('fs')

//改变内部链接打开方式
app.on('web-contents-created', (e, webContents) => {
  
  webContents.setWindowOpenHandler(({ url, frameName }) =>
  { 
    //外部链接
    if(url.toString().startsWith('https://www.google.com/url?q=')){  

      target = url.toString().split('q=')[1];
      shell.openExternal(target);

      return { action: 'delay' };
    }else{
      
      //google内部链接
      return {
        action: "allow", 
        overrideBrowserWindowOptions: {
            width: 1440,
            height: 800,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        }
      };
    }
  });
    
  //webContents.on('new-window', (event, url) => {
      //event.preventDefault();
      //shell.openExternal(url);
  //});
});

let mainwin = null;

//createWindow
let createWindow = function(){
  mainwin = new BrowserWindow({
  	// 初始化窗口的宽高
    x:0,
    y:0,
    width:1440,
    height:800,
    icon: `${__dirname}/favicon.icns`,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false, 
      preload: path.join(__dirname, '/src/preload.js'),
    },
  })

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '/public/images/gmail-logo.png'));
  }

  // 在主窗口中加载html文件，html中的内容会显示在窗口中
  //mainwin.loadFile(__dirname+'/src/index.html');
  //mainwin.loadURL('https://blog.peos.cn');
  mainwin.loadURL('https://mail.google.com/mail/u/0/#inbox');
  

  mainwin.webContents.on('dom-ready', (e) => {
    //console.log(e)
    const css = fs.readFileSync(path.join(__dirname, '/src/mail.css')).toString();
    mainwin.webContents.insertCSS(css);

    const js = fs.readFileSync(path.join(__dirname, '/src/mail.js')).toString();
    mainwin.webContents.executeJavaScript(js);
  })

  

  let childwin = new BrowserWindow({// 初始化窗口的宽高
    x:0,
    y:0,
    width:1440,
    height:800,
    show: false, 
    icon: `${__dirname}/favicon.icns`,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false, 
    },
  });

  childwin.loadURL('https://calendar.google.com/calendar/u/0/r/day');
  //mainwin.webContents.openDevTools();
  //childwin.webContents.openDevTools();
  childwin.webContents.on('dom-ready', (e) => { 

    const js = fs.readFileSync(path.join(__dirname, '/src/calendar.js')).toString();
    childwin.webContents.executeJavaScript(js);
  })


  ipcMain.on('badgeCount', (e, args)=>{
    //console.log('MailList:')
    //console.log(MailList)
    console.log('ipcMain:')
    console.log(args);
    app.badgeCount = args;
  })

  ipcMain.on('newMail', (e,args)=>{

    let isnew = true;

    for(let i in MailList){

      let mail = MailList[i];
      //console.log(mail.id +', '+args.id);

      if(mail.id == args.id){
        isnew = false;
      }
    }
    if(isnew){
      MailList.push(args);
      showNotification('[Mail] '+args.title, args.body+'\n'+args.time);
    }
    if (MailList.length>10) {
      
    }
  })


  let MailList = [];
  let MeetList = [];

  ipcMain.on('newMeet', (e,args)=>{

    let isnew = true;

    for(let i in MeetList){
      let meet = MeetList[i];
      if(meet.id == args.id){
        isnew = false;
      }
    }

    if(isnew){
      MeetList.push(args);
      showNotification('[Meeting] '+args.user, args.title+'\n'+ args.time);
    }
    if (MeetList.length>10) {
      
    }
  })
  
  mainwin.on("close", (e)=>{
    e.preventDefault();
    mainwin.hide();
  })

  mainwin.on("closed", (e)=>{
    mainwin = null;
  })
}


//显示通知
let showNotification = function(title, body) {
  new Notification({ title: title, body: body,icon: path.join(__dirname,"/public/images/gmail-logo.png")   }).show();
}


//创建tray
var appIcon = null;
let createTray = function(){
  appIcon = new Tray(__dirname + "/public/images/tray_icon.png");

  var contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Quit', 
      click: (e)=>{
        app.exit(0);
      }
    }, 
  ]); 
  appIcon.setContextMenu(contextMenu);
}

//绑定生命周期事件
app.on('ready',() => {
  console.log(__dirname)
  createWindow();

  createTray();

})

//mac 下面不关闭
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

//点击显示主窗口
app.on('activate', () => {
  //console.log(mainwin);
  if (mainwin === null){
    createWindow();
  }else{
    mainwin.show();
  }
  
})



// //热加载
// const reloder = require("electron-reloader")
// // module模块对象是所有对象
// reloder(module);

