export default ()=> {
    const TIP = 'tip_'
    const SCROLL = 'scroll_'
    return {
        // 模板文件
        TEMPLATE_XML: './libs/krpano/krpano.xml', 

        // 插件路径
        PLUGIN_URL: './libs/krpano/plugin', 

        // 空场景名称
        EMPTY_SCENE_NAME: 'emptyScene', 

        // 普通热点编辑框的名称
        COMMON_HS_EDIT_RECT: 'editingTarget',
        
        // 普通热点文字标注默认样式
        COMMON_HS_DEFAULT_TIP_CSS: {
            'text-align':'center',
            'color':'#FFFFFF',
            'font-family':'MicrosoftYahei',
            'font-size':'12px',
            'padding':'5px',
        },

        // 场景命名前缀
        PREFIXX_SCENE: 'sc_',

        //普通热点及其文字标注命名前缀
        PREFIXX_HS:'hs_',
        PREFIXX_HS_TIP: TIP + 'hs_',

        //矩形及其文字标注命名前缀
        PREFIXX_RECT:'rect_',
        PREFIXX_RECT_TIP: TIP + 'rect_',

        //圆形及其文字标注命名前缀
        PREFIXX_CIRCLE:'circle_',
        PREFIXX_CIRCLE_TIP: TIP + 'circle_',

        //线段及其文字标注命名前缀
        PREFIXX_LINE:'line_',
        PREFIXX_LINE_TIP: TIP + 'line_',

        //箭头及其文字标注命名前缀
        PREFIXX_ARROW:'arrow_',
        PREFIXX_ARROW_TIP: TIP + 'arrow_',

        //画笔命名前缀
        PREFIXX_BRUSH:'brush_',

        //文本命名前缀
        PREFIXX_TEXT:'text_',

        //马赛克命名前缀
        PREFIXX_MOSAIC:'mosaic_',

        //标注及其滚动区域框命名前缀
        PREFIXX_MARK:'mark_', // 标注框
        PREFIXX_MARK_SCROLL_CONTAINER: SCROLL + 'container_', // 最外部容器
        PREFIXX_MARK_SCROLL_BOX: SCROLL + 'box_', // 滚动区域盒子
        PREFIXX_MARK_SCROLL_CTX: SCROLL + 'ctx_', // 滚动内容 
        PREFIXX_MARK_SCROLL_BAR_BG: SCROLL + 'bar_bg_', //滚动条背景
        PREFIXX_MARK_SCROLL_BAR: SCROLL + 'bar_', //滚动条

        TIP, SCROLL,
    }
}


