import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
// import { AppDataSource } from './database/index.js'
import { DataSource, EntitySchema } from 'typeorm'
// import { CategoryEntity } from './database/entities/scene.js'

class Category {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

const CategoryEntity = new EntitySchema({
    name: "Category",
    target: Category,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        }
    }
})

const getUserQueryBuilder = async (AppDataSource) => {
  return AppDataSource.getRepository(CategoryEntity).createQueryBuilder('scene');
};

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  // if (!AppDataSource.isInitialized) {
  //   const [err, _res] = await to(AppDataSource.initialize())
  //   if (err) {
  //     throw err
  //   }
  // }
  const database = 'database.sqlite';
  console.log(database,'🤣🤣🤣');
  
  const db = new DataSource({
    type: "better-sqlite3", // 设定链接的数据库类型
    database:'./database.sqlite', // 数据库存放地址
    synchronize: true, // 确保每次运行应用程序时实体都将与数据库同步
    logging: ['error','warn'], // 日志，默认在控制台中打印，数组列举错误类型枚举
    entities: [CategoryEntity], // 实体或模型表
  })

  db.initialize()

  const c = new Category(0, "TypeScript")
  console.log(c, 'xxxxxxxxxxx')
  // db.getRepository(CategoryEntity).insert()


  // getUserQueryBuilder(AS).then(res=>{
  //   return res.insert().values(new CategoryEntity({ name:'测试',url:'21312' })).execute();
  // }).then(()=>{
  //   getUserQueryBuilder(AS).then(res=>{
  //     return res.findOneBy({ name:'测试' });
  //   })
  // })


  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('overlay-dblclick', () => {
    console.log('✅ 子窗口捕获并上报了双击事件')
    mainWin.webContents.send('dblclick-from-overlay') // 你可以进一步发给主窗口 UI 层
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.




// let childWin = null

// function createChildWindow() {
//   const { screen } = require('electron')
//   const display = screen.getPrimaryDisplay()
//   const { width, height } = display.bounds

//   childWin = new BrowserWindow({
//     width,
//     height,
//     x: 0,
//     y: 0,
//     frame: false,            // 无边框
//     transparent: true,       // 透明窗口
//     resizable: false,
//     movable: false,
//     fullscreen: true,
//     skipTaskbar: true,       // 不显示在任务栏
//     alwaysOnTop: true,       // 保持在最前
//     hasShadow: false,
//     focusable: false,        // 防止聚焦（配合点击穿透）
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       nodeIntegration: true,
//       contextIsolation: false,
//     }
//   })

//   // 加载窗口内容
//   // childWin.loadFile('renderer.html')
//   childWin.loadFile(join(__dirname, '../renderer/childindex.html'))
//   // 设置忽略鼠标事件，允许事件传递给下面窗口
//   childWin.setIgnoreMouseEvents(true, { forward: true })

//   // 开发调试可开启
//   // childWin.webContents.openDevTools()
// }

// app.whenReady().then(() => {
//   createChildWindow()

//   app.on('activate', function () {
//     if (BrowserWindow.getAllWindows().length === 0) createChildWindow()
//   })
// })

// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') app.quit()
// })
