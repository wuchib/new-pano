import { ipcMain, app, dialog, BrowserWindow } from 'electron'
import path from 'path';
import { ensureFolderExists, createFile, deletePaths } from '../utils/index'
import Scene from "../database/model/scene";
// import { DataSource, Like, In } from 'typeorm'
import fs from 'fs'

/**
 * 
 * @param {BrowserWindow} win 
 * @param {} db 
 */
function registerIpc(win, db) {
    ipcMain.handle('get-current-time', async () => {
        const now = new Date().toLocaleString();
        return now;
    });

    // 保存场景
    ipcMain.handle('save-scene', async (event, sceneData) => {
        // const sceneId = sceneData.id
        // const sceneTable = db.getRepository('Scene')
        // // 查询数据是否存在
        // const row = await sceneTable.findOne({
        //     where: {
        //         id: sceneId
        //     }
        // })
        // if (row === null) {
        //     // 若无此数据，生成data.json文件并在数据库新增一条数据
        //     const userDataPath = app.getPath('userData')
        //     const myDataPath = ensureFolderExists(userDataPath, 'myData')
        //     const scenePath = ensureFolderExists(myDataPath, sceneId)
        //     const dataJsonPath = createFile(scenePath, 'data.json', sceneData)
        //     const scene = new Scene(sceneId, sceneData.base.name, scenePath)
        //     sceneTable.insert(scene)
        //     return dataJsonPath
        // } else {
        //     // 若有此数据，将原有的data.json文件覆盖
        //     fs.writeFileSync(row.url, JSON.stringify(sceneData, null, 2), 'utf-8')
        //     sceneTable.update(row.id, {
        //         name: sceneData.base.name
        //     })
        // }
        return '保存成功'
    })

    // 删除场景
    ipcMain.handle('del-scene', async (event, ids) => {
        // if (ids && ids.length > 0) {
        //     const sceneTable = db.getRepository('Scene')
        //     const rows = await sceneTable.find({
        //         where: { id: In(ids) },
        //         select: ["url"] // 只选择需要的字段
        //     })
        //     // 根据urls去删除递归删除文件夹中的东西
        //     console.log(rows);
        //     await deletePaths(rows.map(r=>r.url))
        //     // 删除数据库的字段
        //     const res = await sceneTable.delete(ids)
        //     return res
        // } else {
        //     return '没有id值'
        // }
        return
    })
    

    // 本地选择图片
    ipcMain.handle('check-local-pano', async (event) => {
        // 1) 选择单个文件
        // const result = dialog.showOpenDialogSync(win, {
        //     title: '请选择图片',
        //     defaultPath: app.getPath('documents'),
        //     filters: [
        //         { name: '图片', extensions: ['jpg', 'png'] },
        //         { name: '所有文件', extensions: ['*'] }
        //     ],
        //     properties: ['openFile']
        // });
        // return result
        return
    })

    // 获取分页列表(按照创建时间逆序)
    ipcMain.handle('get-scene-list', async (event, params) => {
        // const sceneTable = db.getRepository('Scene')
        // const { keyWord, pageNo, pageSize } = params

        // const where = keyWord === '' ? {} : {
        //     name: Like(`%${keyWord}%`)
        // }
        // const skip = (pageNo - 1) * pageSize;
        // const [rows, total] = await sceneTable.findAndCount({
        //     where,
        //     skip,
        //     take: pageSize
        // })
        // return { rows, total }
        return
    })

    // 获取场景json数据
    ipcMain.handle('get-scene-json-by-id', async (event, id) => {
        // const userDataPath = app.getPath('userData')
        // const myDataPath = ensureFolderExists(userDataPath, 'myData')
        // const scenePath = ensureFolderExists(myDataPath, id)
        // const content = fs.readFileSync(`${scenePath}/data.json`, 'utf-8')
        // return JSON.parse(content)
        return
    })
}

export default registerIpc