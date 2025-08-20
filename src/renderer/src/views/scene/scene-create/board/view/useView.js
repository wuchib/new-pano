import { cloneDeep } from 'lodash'
import { ref } from 'vue'
function useView({ curPanoData }) {
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
    function toBeginAngle({ curFov, vlookat, hlookat, minFov, maxFov }) {
        if (krpano) krpano.actions.lookto(hlookat, vlookat, curFov + 30, "smooth", true, true)
    }
    function setViewConifg() {
        const { hlookat, vlookat, fov } = krpano.view;
        if(ViewBoardRef.value){
            ViewBoardRef.value.setConfig({ hlookat, vlookat, fov: fov - 30 });
            const config = ViewBoardRef.value.getConfig()
            curPanoData.value.view = config
        }
        
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
        setInstance,
        toBeginAngle
    }
}

export default useView