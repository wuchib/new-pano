import { ref, computed } from 'vue'
function useFooterToggle() {
    const isShowP = ref(true)
    // 列表样式
    const slideMainStyle = computed(()=>isShowP.value ? { transform: `translateY(0)`, opacity: '1'} : { transform: `translateY(100%)`, opacity: '0' })

    // 滑块样式
    const slideBtnStyle = computed(()=>({transform: `translateY(${isShowP.value ? '-141px' : '0px'})`}))
    // 滑块图标样式
    const slideIconStyle = computed(() => ({ transform: `rotate(${isShowP.value ? '0' : '180deg'})` }))

    // 切换状态过渡调整
    const transition = computed(() =>({transition: isShowP.value ? 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out' : 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out 0.3s'}))

    return {
        isShowP,
        slideMainStyle,
        slideBtnStyle,
        slideIconStyle,
        transition
    }
}

export default useFooterToggle