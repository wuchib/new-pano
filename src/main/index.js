import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { AppDataSource } from './database/index'
import Scene from "./database/model/scene";
import registerIpc from './ipc/index'

let mainWindow
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false   // 粗暴关闭同源策略
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

  //===== 测试一下数据库连接以及插入数据 start
  const dbIns = await AppDataSource.initialize()
  const repository = dbIns.getRepository('Scene')
  const scene1 = new Scene(null, "cbiu", "12345")
  repository.insert(scene1)
  //===== 测试一下数据库连接以及插入数据 end

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

  // 注册ipc,构建通信
  createWindow()
  registerIpc(mainWindow)

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
