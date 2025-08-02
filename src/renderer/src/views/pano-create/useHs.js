import { useMessage, useDialog } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid';
import { ref } from 'vue'
import { initPanorama, Scene, View, CommonHs, PolygonHs, Event } from '@renderer/utils/krpano/index.js'

function useHs({
    HotspotBoardRef,
    isEdit,
    isAddEdit,
    curEntity,
    curEntityId
}) {
    const nDialog = useDialog()
    const message = useMessage()
    /**@type { CommonHs } */
    let commonHsInstance = null
    /**@type { View } */
    let viewInstance = null
    const editOriginCnf = ref(null)
    // 保存的热点列表
    const hsList = ref([])

    function setInstance({ _commonHsInstance, _viewInstance }) {
        commonHsInstance = _commonHsInstance
        viewInstance = _viewInstance
    }

    // 添加热点
    function addHotspot() {
        if (isAddEdit.value && curEntity.value === null) {
            curEntityId.value = uuidv4()
            const { title: txt, url } = HotspotBoardRef.value.getHsConfig()
            console.log({ id: curEntityId.value, url, txt });

            curEntity.value = commonHsInstance.addHotspot({ id: curEntityId.value, url, txt })
            const { ath, atv } = curEntity.value._hs
            HotspotBoardRef.value.setHsConfig({ ath, atv })
        }
    }

    // 保存热点callback
    function saveHs() {
        if (curEntity.value === null) {
            message.warning('请先添加热点')
            return
        }
        const curConig = HotspotBoardRef.value.getHsConfig()
        const { title, url, fontSize, fontColor, ath, atv } = curConig
        if (isEdit.value) {
            const targetHsCnf = hsList.value.find(h => h.id === curEntityId.value)
            if (targetHsCnf === undefined) return
            targetHsCnf.url = url
            targetHsCnf.title = title
            targetHsCnf.fontSize = fontSize
            targetHsCnf.fontColor = fontColor
        } else {
            const newHs = {
                id: curEntityId.value,
                title, url, fontSize, fontColor, ath, atv
            }
            hsList.value.push(newHs)
            commonHsInstance.setHotspotClickEvent(newHs.id, () => {
                HotspotBoardRef.value.editHs(newHs, false)
            }, false)
        }
        clearCurEntityMeta()
        isAddEdit.value = false
        isEdit.value = false
    }

    // 改变热点配置
    function changeHsConfig({ title, fontSize, fontColor, url }) {
        if (curEntity.value === null) return
        if (url) curEntity.value._hs.url = url
        commonHsInstance.addTip(curEntity.value._hs.name, title, { 'font-size': fontSize, 'color': fontColor })
    }

    // 删除热点callback
    function delHs() {
        if (curEntity.value === null) return
        commonHsInstance.delEntity('', curEntityId.value)
        const targetIndex = hsList.value.findIndex(hs => hs.id === curEntityId.value)
        if (targetIndex !== -1) hsList.value.splice(targetIndex, 1)
        clearCurEntityMeta()
        isAddEdit.value = false
        isEdit.value = false
    }

    // 编辑热点callback
    function editHs(hsConfig, autoView = true) {
        editOriginCnf.value = JSON.parse(JSON.stringify(hsConfig))
        if (autoView) {
            viewInstance.lookToPosition(hsConfig.ath, hsConfig.atv, null, () => {
                commonHsInstance.setEditRect(hsConfig.id, true)
                isAddEdit.value = true
                isEdit.value = true
                curEntity.value = commonHsInstance.getEntity('', hsConfig.id)
                curEntityId.value = hsConfig.id
            })
        } else {
            commonHsInstance.setEditRect(hsConfig.id, true)
            isAddEdit.value = true
            isEdit.value = true
            curEntity.value = commonHsInstance.getEntity('', hsConfig.id)
            curEntityId.value = hsConfig.id
        }
    }

    // 还原热点配置
    function restoreHs(cnf) {
        const { ath, atv, title, url, fontSize, fontColor } = cnf
        curEntity.value._hs.ath = ath
        curEntity.value._hs.atv = atv
        curEntity.value._hs.url = url
        commonHsInstance.addTip(curEntity.value._hs.name, title, { 'font-size': fontSize, 'color': fontColor })
        clearCurEntityMeta()
        isAddEdit.value = false
        isEdit.value = false
    }

    // 清除当前的热点信息
    function clearCurEntityMeta() {
        curEntity.value = null
        curEntityId.value = ''
        commonHsInstance.hideEditRectTip()
    }

    // 批量删除热点
    function bacthDelHs() {
        const remainHsData = []
        if (hsList.value.filter(hs => hs.isChecked === true).length === 0) {
            message.warning('请选择删除的热点')
            return
        }
        nDialog.warning({
            title: '提示',
            content: '是否删除选中热点',
            positiveText: '确认删除',
            negativeText: '取消',
            maskClosable: false,
            closeOnEsc: false,
            // 确认删除
            onPositiveClick: () => {
                hsList.value.forEach(hs => {
                    if (hs.isChecked === true) {
                        commonHsInstance.delEntity('', hs.id)
                    } else {
                        remainHsData.push(hs)
                    }
                })
                hsList.value = JSON.parse(JSON.stringify(remainHsData))
            },
            // 取消
            onNegativeClick: () => {
                hsList.value.forEach(hs => { hs.isChecked = false })
            }
        })
    }
    // 拖拽热点时的回调
    function hsDragCb(ath, atv) {
        HotspotBoardRef.value.setHsConfig({ ath, atv })
    }

    return {
        hsList,
        editOriginCnf,
        restoreHs,
        editHs,
        delHs,
        saveHs,
        bacthDelHs,
        hsDragCb,
        addHotspot,
        changeHsConfig,
        setInstance
    }
}

export default useHs