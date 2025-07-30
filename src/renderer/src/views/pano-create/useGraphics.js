import { ref } from 'vue'

function useGraphics() {

    const graphicsList = ref([])
    const editOriginGraphicsCnf = ref([])

    function changeGraphicsConfig() { }
    function saveGraphics() { }
    function delGraphics() { }
    function editGraphics() { }
    function restoreGraphics() { }
    function bacthDelGraphics() { }
    function addGraphics() { }
    function setInstance() { }
    function graphicsDragCb() { }

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