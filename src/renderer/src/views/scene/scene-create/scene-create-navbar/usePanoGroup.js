import { computed, h, ref, watch } from 'vue'
import { initGroups } from '../common/mock'
import { useDialog, NInput } from 'naive-ui'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash'

function usePanoGroup() {
    const dialog = useDialog()
    const groups = ref(initGroups) // 分组列表
    const curGroupId = ref('') // 当前选中的分组id
    const curPanoId = ref('') // 当前选中的场景id


    // 当前选中的分组数据对象
    const curGroupData = computed(() => {
        const target = groups.value.find(g => g.id === curGroupId.value)
        curPanoId.value = (target?.panoList && target.panoList.length > 0) ? target.panoList[0].id : ''
        if (!target) return null
        return target
    })
    // 当前选中的场景数据对象
    const curPanoData = computed(() => {
        if(curGroupData.value === null) return null
        const target = curGroupData.value?.panoList?.find(sc => sc.id === curPanoId.value)
        if (!target) return null
        return target
    })

    const newName = ref('')
    // 新增分组
    function addGroup() {
        dialog.create({
            title: () => h('div', { class: 'text-[14px]' }, '请输入分组名称'),
            showIcon: false,
            positiveText: '确定',
            negativeText: '取消',
            content: () => h(NInput, {
                class: 'mt-[8px]',
                maxlength: 20,
                showCount: true,
                placeholder:'',
                value: newName.value, // 绑定值
                'onUpdate:value': (val) => (newName.value = val), // 更新值
            }),
            onPositiveClick: confirmAddGroup,
            onNegativeClick: () => {
                newName.value = ''
            }
        })
    }

    // 确认新增分组
    function confirmAddGroup() {
        const id = uuidv4()
        const newG = {
            id,
            name: newName.value,
            panoList: []
        }
        groups.value.push(newG)
        newName.value = ''
        if(groups.value.length === 1) curGroupId.value = id
    }

    // 新增全景照片
    async function addPano(type) {
        if (type === 'local') {
            const id = uuidv4()
            const urls = await window.customApi.checkLocalPano()
            const newPano = { id, name: '图片', url: urls[0] }
            curGroupData.value.panoList.push(newPano)
            if(curGroupData.value.panoList.length === 1) curPanoId.value = id
        }
    }

    // 切换当前分组下的全景照片
    function togglePano(pano){
        curPanoId.value = pano.id
        // emits('togglePano',pano)
    }

    // 切换分组
    function toggleGroup(gid){
        curGroupId.value = gid
    }
    
    
    return {
        groups,
        curGroupId,
        curPanoId,
        curGroupData,
        curPanoData,
        togglePano,
        addGroup,
        addPano,
        toggleGroup
    }
}

export default usePanoGroup