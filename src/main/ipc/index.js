import { ipcMain, app, dialog, BrowserWindow } from 'electron'
import path from 'path';
import { ensureFolderExists, createFile } from '../utils/index'
import Scene from "../database/model/scene";
import { DataSource } from 'typeorm'

/**
 * 
 * @param {BrowserWindow} win 
 * @param {DataSource} db 
 */
function registerIpc(win, db) {
    ipcMain.handle('get-current-time', async () => {
        const now = new Date().toLocaleString();
        return now;
    });

    ipcMain.handle('save-scene', async (event, sceneData) => {
        const sceneId = sceneData.id
        const sceneTable = db.getRepository('Scene')
        // 查询数据是否存在
        const row = await sceneTable.findOne({
            where: {
                id: sceneId
            }
        })
        if (row === null) {
            // 若无此数据，生成data.json文件并在数据库新增一条数据
            const userDataPath = app.getPath('userData')
            const myDataPath = ensureFolderExists(userDataPath, 'myData')
            const scenePath = ensureFolderExists(myDataPath, sceneId)
            const dataJsonPath = createFile(scenePath, 'data.json', sceneData)
            const scene = new Scene(sceneId, sceneData.base.name, dataJsonPath)
            sceneTable.insert(scene)
            return dataJsonPath
        }else{
            // 若有此数据，将原有的data.json文件覆盖
            
        }
        return row
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