import { ipcMain, app, dialog } from 'electron'
import path from 'path';
import { ensureFolderExists, createFile } from '../utils/index'

function registerIpc(win) {
    ipcMain.handle('get-current-time', async () => {
        const now = new Date().toLocaleString();
        return now;
    });


    ipcMain.handle('save-scene', async (event, sceneData) => {
        const userDataPath = app.getPath('userData')
        const myDataPath = ensureFolderExists(userDataPath, 'myData')
        const sceneId = sceneData.base.id
        const scenePath = ensureFolderExists(myDataPath, sceneId)
        const dataJsonPath = createFile(scenePath, 'data.json', sceneData)
        return dataJsonPath
    })

    ipcMain.handle('check-local-pano', async (event) => {
        // 1) 选择单个文件
        const result = dialog.showOpenDialogSync(win, {
            title: '请选择图片',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: '图片', extensions: ['jpg', 'png'] },
                { name: '所有文件', extensions: ['*'] }
            ],
            properties: ['openFile']
        });
        return result
    })
}

export default registerIpc