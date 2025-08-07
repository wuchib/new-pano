import { ipcMain, app } from 'electron'
import path from 'path';
import { ensureFolderExists, createFile } from '../utils/index'

function registerIpc() {
    ipcMain.handle('get-current-time', async () => {
        const now = new Date().toLocaleString();
        return now;
    });


    ipcMain.handle('save-scene', async (event,sceneData) => {
        const userDataPath = app.getPath('userData')
        const myDataPath = ensureFolderExists(userDataPath, 'myData')
        const sceneId = sceneData.base.id
        const scenePath = ensureFolderExists(myDataPath, sceneId)
        const dataJsonPath = createFile(scenePath,'data.json',sceneData)
        return dataJsonPath
    })
}

export default registerIpc