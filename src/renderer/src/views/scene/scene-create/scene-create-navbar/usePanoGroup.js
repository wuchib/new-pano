import { computed, ref } from 'vue'
import { initGroups } from '../common/mock'

function usePanoGroup() {
    const groups = ref(initGroups) // 分组列表
    const curGroupId = ref('group_1') // 当前选中的分组id
    const curSceneId = ref('scene_1_1') // 当前选中的场景id

    const sceneHandleOpt = ref([
        { key: 'copy', label: '复制' },
        { key: 'del', label: '删除' },
    ])

    // 当前选中的分组数据对象
    const curGroupData = computed(() => {
        const target = groups.value.find(g => g.id === curGroupId.value)
        if (!target) return null
        return target
    })
    // 当前选中的场景数据对象
    const curSceneData = computed(() => {
        const target = curGroupData.value.find(sc => sc.id === curSceneId.value)
        if (!target) return null
        return target
    })

    return {
        groups,
        curGroupId,
        curSceneId,
        curGroupData,
        curSceneData,
        sceneHandleOpt
    }
}

export default usePanoGroup