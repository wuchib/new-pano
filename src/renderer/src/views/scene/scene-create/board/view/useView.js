import { ref } from 'vue'
function useView() {
    const ViewBoardRef = ref()
    let krpano = null
    function changeViewMin(val) {
        if (krpano) krpano.view.fovmin = val + 30
    }
    function changeViewCenter(val) {
        if (krpano) krpano.view.fov = val + 30
    }
    function changeViewMax(val) {
        if (krpano) krpano.view.fovmax = val + 30
    }
    function setViewConifg() {
        const { hlookat, vlookat, fov } = krpano.view;
        ViewBoardRef.value && ViewBoardRef.value.setConfig({ hlookat, vlookat, fov });
    }
    function setInstance(krp) {
        krpano = krp
    }

    return {
        ViewBoardRef,
        changeViewMin,
        changeViewCenter,
        changeViewMax,
        setViewConifg,
        setInstance
    }
}

export default useView