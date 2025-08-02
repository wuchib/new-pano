import { useMessage, useDialog } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid';
import { ref } from 'vue'
import { initPanorama, Scene, View, CommonHs, PolygonHs, Event } from '@renderer/utils/krpano/index.js'
function useGraphics({
    paintBoardRef,
    isEdit,
    isAddEdit,
    curEntity,
    curEntityId
}) {
    const nDialog = useDialog()
    const message = useMessage()


    /**@type {PolygonHs} */
    let polygonHsInstance = null // 图形工具实例
    /**@type {View} */
    let viewInstance = null // 视角工具实例
    /**@type {CommonHs} */
    let commonHsInstance = null // 视角工具实例

    // 图形列表
    const graphicsList = ref([])
    const editOriginGraphicsCnf = ref([])

    function changeGraphicsConfig({ title, fontSize, fontColor, borderSize, paintType }) {
        if (curEntity.value === null) return
        curEntity.value._tip.html = `<div style="box-sizing:border-box;padding:5px;font-size:${fontSize}px;color:${fontColor}">${title}</div>`
        curEntity.value._hs.bordercolor = fontColor.replace('#', '0x')
        curEntity.value._hs.borderwidth = borderSize
        // console.log(polygonHsInstance);
        // console.log(curEntityId.value);
        // polygonHsInstance.setPolygonTip(curEntityId.value, { title, titleFontSize: fontSize }, paintType)
    }
    /**保存图形 */
    function saveGraphics() {
        if (curEntity.value === null) {
            message.warning('请先绘制图形')
            return
        }
        const config = paintBoardRef.value.getConfig()
        if (isEdit.value) { // 编辑的时候保存-改变配置
            const target = graphicsList.value.find(item => item.id === curEntityId.value)
            if(!target) return
            for (const key in config) {
                target[key] = config[key]
            }
        } else {  // 新增的时候保存
            const newGraphics = {
                ...config,
                id: curEntityId.value,
            }
            graphicsList.value.push(newGraphics)
        }
        curEntity.value._hs.dragging = false
        polygonHsInstance.hideAllCtrlPoints()
        viewInstance.userControl('all')
        curEntity.value = null
        curEntityId.value = null
        isAddEdit.value = false
        isEdit.value = false
    }
    /**删除图形 */
    function delGraphics() {
        if (curEntity.value === null) {
            message.warning('暂无图形')
            return
        }
        if(isEdit.value){
            const targetIndex = graphicsList.value.findIndex(item => item.id === curEntityId.value)
            if(targetIndex !== -1) graphicsList.value.splice(targetIndex, 1)
        }
        const { paintType } = paintBoardRef.value.getConfig() // 获取配置
        commonHsInstance.delEntity(paintType, curEntityId.value) // 删除操作
        polygonHsInstance.hideAllCtrlPoints()
        curEntity.value = null
        curEntityId.value = null
        // isAddEdit.value = false
        // isEdit.value = false
    }
    /**编辑图形 */
    function editGraphics(hsCnf, autoView) {
        const { id, paintType } = hsCnf
        // 1. 找到实体
        curEntityId.value = id
        curEntity.value = polygonHsInstance.getEntity(paintType, id)
        curEntity.value._hs.dragging = true
        // 2. 跳转到图形位置并恢复控制点
        viewInstance.lookToHs(curEntity.value._hs.name)
        polygonHsInstance.drawControlPoints(curEntityId.value, paintType)
        // 3. 锁住镜头
        viewInstance.userControl('off')
        // 4. 信息回显
        isAddEdit.value = true
        isEdit.value = true
        paintBoardRef.value.setConfig(hsCnf)
    }
    function restoreGraphics() { }
    function bacthDelGraphics() { }
    function addGraphics() {
        // 把镜头锁住
        viewInstance.userControl('off')
        const { title, borderColor, borderSize, paintType } = paintBoardRef.value.getConfig()
        const id = uuidv4()
        const hash = {
            'rect': () => {
                return polygonHsInstance.drawRect({ id, borderColor, borderSize })
            },
            'circle': () => {
                return polygonHsInstance.drawCircle({ id, borderColor, borderSize })
            },
            'brush': () => { },
            'mark': () => { },
            'line': () => {
                return polygonHsInstance.drawLine({ id, borderColor, borderSize })

            },
            'arrow': () => {
                return polygonHsInstance.drawArrow({ id, borderColor, borderSize })
            },
        }
        curEntity.value = hash[paintType]()
        curEntityId.value = id
    }

    function setInstance({ _polygonHsInstance, _viewInstance, _commonHsInstance }) {
        polygonHsInstance = _polygonHsInstance
        viewInstance = _viewInstance
        commonHsInstance = _commonHsInstance
    }
    function graphicsDragCb() {

    }

    return {
        graphicsList,
        editOriginGraphicsCnf,
        changeGraphicsConfig,
        saveGraphics,
        delGraphics,
        editGraphics,
        restoreGraphics,
        bacthDelGraphics,
        addGraphics,
        setInstance,
        graphicsDragCb,
    }
}

export default useGraphics