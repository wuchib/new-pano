
import config from './config'
const { EMPTY_SCENE_NAME, PLUGIN_URL, PREFIXX_SCENE } = config()

// 场景类
export class Scene {
    krpano
    constructor(kp){ 
        this.krpano = kp
        this.createEmptyScene()
    }
    
    /**
    * 获取所有场景，以数组形式返回。
    * @returns {Array} 
    */
    get allScenes(){
        return this.krpano.scene.getArray()
    }

    /**
    * 加载场景。
    * @param {string} sceneId - 场景id。
    * @returns {undefined} 
    */
    loadSceneInKp(sceneId){
        const sceneName = PREFIXX_SCENE + sceneId
        // this.krpano.call(`loadscene('${sceneName || EMPTY_SCENE_NAME}', null, MERGE, BLEND(0.5));`)
        this.krpano.call(`loadscene('${sceneId ? sceneName : EMPTY_SCENE_NAME}', null, MERGE, BLEND(0.5));`)
    }

    /**
    * 异步加载场景。
    * @param {string} sceneId - 场景id。
    * @returns {undefined} 
    */
    loadSceneAsync(sceneId) {
        const sceneName = PREFIXX_SCENE + sceneId
        return new Promise((resolve) => {
            this.krpano.set("events.onloadcomplete", () => {
                console.log(`%c场景[${sceneName}]已加载`,'color: #10a3f8;font-weight: 600;font-size: 16px;')
                this.krpano.set("events.onloadcomplete", null);
                resolve()
            })
            // 加载场景
            this.krpano.call(`loadscene('${ sceneId ? sceneName : EMPTY_SCENE_NAME}', null, MERGE, BLEND(0.5));`)
        })
    }

    /**
    * 创建空场景。
    * @returns {undefined} 
    */
    createEmptyScene(){
        this.krpano.set(`scene[${EMPTY_SCENE_NAME}].content`, `<image><sphere url="" /></image>`)
    }

    /**
    * 新增场景。
    * @param {{sceneId:string, imgUrl:string}} params - sceneName：场景id。 imgUrl：场景图片链接
    * @returns {undefined} 
    */
    addSceneInKp({sceneId, imgUrl}){
        if(!sceneId && !imgUrl) return
        const sceneName = PREFIXX_SCENE + sceneId
        const sceneContent = `
          <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" fovmin="1" fovmax="179" limitview="auto" />
          <image>
            <sphere url="${imgUrl}" />
          </image>
        `
        this.krpano.set(`scene[${sceneName}].content`, sceneContent)
    }  

    /**
    * 根据场景名称删除场景。
    * @param {string} sceneId - 场景id。
    * @returns {undefined} 
    */
    removeSceneInKp(sceneId){
        const sceneName = PREFIXX_SCENE + sceneId
        const targetIndex = this.allScenes.findIndex(scene => scene.name === sceneName)
        if(targetIndex !== -1) this.krpano.scene.removearrayitem(sceneName, targetIndex)
    }

    /**
    * 新增画布场景。
    * @param {{sceneId:string, imgUrl:string}} params - sceneName：场景名称。 imgUrl：场景图片链接
    * @returns {undefined} 
    */
    addCanvasSceneInKp({sceneId, imgUrl}){
        if(!sceneId && !imgUrl) return
        const sceneName = PREFIXX_SCENE + sceneId
        const sceneContent = `
          <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" fovmin="1" fovmax="179" limitview="auto" />
          <plugin name="canvas" url="${PLUGIN_URL}/canvas.js" img_url="${imgUrl}"/>
          <image>
              <sphere url="plugin:canvas"></sphere>
          </image>
        `
        this.krpano.set(`scene[${sceneName}].content`, sceneContent)
    }  
}

export default Scene