import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('customApi', {
      saveScene: (sceneData) => ipcRenderer.invoke('save-scene', sceneData), // 保存场景
      checkLocalPano: () => ipcRenderer.invoke('check-local-pano'), // 选择本地全景图片
      getSceneList: (listParams) => ipcRenderer.invoke('get-scene-list', listParams), // 选择本地全景图片
      getSceneJsonById: (id) => ipcRenderer.invoke('get-scene-json-by-id', id) // 选择本地全景图片
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
