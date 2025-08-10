import { ref } from 'vue'
import { useEventListener } from "@vueuse/core";

function useSilder(type, initVal, total) {
  let sliderDom = null
  let sliderActiveDom = null
  const isDragging = ref(false)

  // 滑块位置
  const position = ref(0)

  // 开始拖拽
  function startDrag(e) {
    e.preventDefault()
    isDragging.value = true;
    updatePosition(e);
    useEventListener(window, "mousemove", onMouseMove);
    useEventListener(window, "mouseup", stopDrag);
  }

  // 拖拽中
  function onMouseMove(e) {
    if (!isDragging.value) return;
    updatePosition(e);
  }

  // 停止拖拽
  function stopDrag() {
    isDragging.value = false;
  }

  // 设置位置
  function setPosition(newInitVal) {
    newInitVal = newInitVal === undefined ? initVal : newInitVal
    let percent
    if (type === 'left') {
      percent = (total - newInitVal) / total * 100
    } else if (type === 'right') {
      percent = (total - newInitVal) / total * 100
    } else if (type === 'center') {
      percent = newInitVal / total * 100
    }
    position.value = percent;
  }

  // 绑定元素
  function bindSliderDom(slotDom, activeDom) {
    sliderDom = slotDom
    sliderActiveDom = activeDom
    setPosition()
  }

  // 更新滑块位置
  function updatePosition(e) {
    const rect = sliderDom.getBoundingClientRect();
    const rectActive = sliderActiveDom.getBoundingClientRect();
    let percent
    if (type === 'left') {
      const x = Math.min(e.clientX, rectActive.right) - rect.left;
      percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    } else if (type === 'right') {
      const x = rect.right - Math.max(e.clientX, rectActive.left);
      percent = Math.min(100, Math.max(0, (x / rect.width) * 100));
    } else if (type === 'center') {
      const x = e.clientX - rect.left;
      const maxRight = (rectActive.right - rect.left) / rect.width * 100
      const maxLeft = (rectActive.left - rect.left) / rect.width * 100
      percent = Math.min(maxRight, Math.max(maxLeft, (x / rect.width) * 100));
    }
    position.value = percent;
  }

  return {
    position,
    isDragging,
    startDrag,
    bindSliderDom,
    setPosition
  }
}

export default useSilder
