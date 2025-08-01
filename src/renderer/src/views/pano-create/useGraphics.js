import { useMessage, useDialog } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid';
import { ref } from 'vue'

function useGraphics({
    paintBoardRef,
    isEdit,
    isHsAddEdit,
    curEntity,
    curEntityId
}) {
    let polygonHsInstance = null // 图形工具实例
    let viewInstance = null // 视角工具实例
    const graphicsList = ref([])
    const editOriginGraphicsCnf = ref([])

    function changeGraphicsConfig({ title, fontSize, fontColor, borderSize, paintType }) {
        if(curEntity.value === null) return
        curEntity.value._tip.html = `<div style="box-sizing:border-box;padding:5px;font-size:${fontSize}px;color:${fontColor}">${title}</div>`
        curEntity.value._hs.bordercolor = fontColor.replace('#','0x')
        curEntity.value._hs.borderwidth = borderSize
        // console.log(polygonHsInstance);
        // console.log(curEntityId.value);
        // polygonHsInstance.setPolygonTip(curEntityId.value, { title, titleFontSize: fontSize }, paintType)
    }
    function saveGraphics() { }
    function delGraphics() { }
    function editGraphics() { }
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
    function setInstance({ _polygonHsInstance, _viewInstance }) {
        polygonHsInstance = _polygonHsInstance
        viewInstance = _viewInstance
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