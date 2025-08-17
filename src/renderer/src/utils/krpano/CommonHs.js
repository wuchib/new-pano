import config from './config.js'
const { 
    COMMON_HS_EDIT_RECT, COMMON_HS_DEFAULT_TIP_CSS,
    PREFIXX_HS, PREFIXX_RECT, PREFIXX_CIRCLE, PREFIXX_LINE, PREFIXX_ARROW, PREFIXX_MARK,PREFIXX_MOSAIC,PREFIXX_TEXT,PREFIXX_BRUSH,
    PREFIXX_HS_TIP, PREFIXX_RECT_TIP, PREFIXX_CIRCLE_TIP, PREFIXX_LINE_TIP, PREFIXX_ARROW_TIP,
    PREFIXX_MARK_SCROLL_CONTAINER, PREFIXX_MARK_SCROLL_CTX,TIP
} = config()


// 热点类
export class CommonHs{
    krpano
    hsDragCb
    constructor(kp,cb){ 
        this.krpano = kp
        this.hsDragCb = cb 
    }
    /**
    *  获取实体 (普通热点或自定义图形)
    * @param { 'rect'|'circle'|'line'|'arrow'|'text'|'mark'|'mosaic'|'brush'| '' } type - 多边形类型,空字符表示非自定义热点
    * @param {string} name - 多边形实体名称
    * @returns {{ _hs:Object, _tip:Object, _scrollCtx:Object }} points - 多边形实体
    */
    getEntity(type, id){
        const entity = { _hs: null, _tip: null, _scrollCtx: null, _scrollContainer:null }
        switch(type) {
            case '': // 普通热点
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_HS + id);
                entity._tip = this.krpano.hotspot.getItem(PREFIXX_HS_TIP + id)
            break;
            
            case 'rect': // 矩形
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_RECT + id);
                entity._tip = this.krpano.hotspot.getItem(PREFIXX_RECT_TIP + id)
            break;

            case 'circle': // 圆形
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_CIRCLE + id);
                entity._tip = this.krpano.hotspot.getItem(PREFIXX_CIRCLE_TIP + id)
            break;

            case 'line':  // 线段
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_LINE + id);
                entity._tip = this.krpano.hotspot.getItem(PREFIXX_LINE_TIP + id)
            break;

            case 'arrow':  //箭头
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_ARROW + id);
                entity._tip = this.krpano.hotspot.getItem(PREFIXX_ARROW_TIP + id)
            break;

            case 'text': //文本
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_TEXT + id);
            break;

            case 'brush': //画笔
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_BRUSH + id);
            break;

            case 'mosaic': //马赛克
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_MOSAIC + id);
            break;

            case 'mark': //标注框
                entity._hs = this.krpano.hotspot.getItem(PREFIXX_MARK + id);
                entity._scrollCtx = this.krpano.layer.getItem(PREFIXX_MARK_SCROLL_CTX + id)
                entity._scrollContainer = this.krpano.layer.getItem(PREFIXX_MARK_SCROLL_CONTAINER + id)
            break;
        }
        return entity
    }

    /**
    * 根据屏幕坐标和热点其他配置添加热点
    * @param {{ id:string, url:string, x:number, y:number, backgroundalpha:number, backgroundcolor:string, txt:string }} params
    * -
    * - id: 热点id。
    * - url: 热点图片链接。
    * - x: 屏幕横坐标。
    * - y: 屏幕纵坐标。
    * - txt: 热点文字标注内容。
    * - backgroundcolor: 热点文字标注背景颜色。
    * - backgroundalpha: 热点文字标注背景透明度。
    * @returns {undefined} 
    */
    addHotspot({ id, url, x = this.krpano.mouse.x, y = this.krpano.mouse.y, backgroundalpha, backgroundcolor, txt, ath, atv }){
        const hotspotName = PREFIXX_HS + id
        let hh, vv
        const { x: h, y: v } = this.krpano.actions.screentosphere(x, y)
        hh = typeof ath === 'number' ? ath : h
        vv = typeof atv === 'number' ? atv : v
        const hs = this.krpano.addhotspot(hotspotName)
        hs.setvars({
            distorted: false, dragging: true, renderer:'webgl',
            url, ath: hh, atv: vv,
            scale:.4, alpha:1, zorder:1,
        })   
        const tip = this.addTip(hotspotName, txt, {}, backgroundalpha, backgroundcolor)
        this.setEditRect(id)
        return { _hs: hs, _tip: tip }
    }

    /**
    * 根据热点属性添加/加载热点
    * @param {{ id:string, url:string, ath:number, atv:number, backgroundalpha:number, backgroundcolor:string, cssObj:object }} params
    * -
    * - id: 热点id。
    * - url: 热点图片链接。
    * - h: 横向角度。
    * - v: 纵向角度。
    * - backgroundcolor: 热点文字标注背景颜色。
    * - backgroundalpha: 热点文字标注背景透明度。
    * @returns {undefined} 
    */  
    loadHotspot({ id, url, ath, atv, txt, cssObj, backgroundalpha, backgroundcolor },isPreView = false){
        const hotspotName = PREFIXX_HS + id
        const tipName = PREFIXX_HS_TIP + id
        const existHs = this.krpano.hotspot.getItem(hotspotName)
        const existTip = this.krpano.hotspot.getItem(tipName)
        if(existHs){
            existHs.visible = true
            existTip.visible = txt !== ''
        }else{
            const hs = this.krpano.addhotspot(hotspotName)
            hs.setvars({
                distorted: false, dragging: true, renderer:'webgl',
                url, ath, atv,
                scale:.4, alpha:1, zorder:1, visible: true
            })
            this.addTip(hotspotName, txt, cssObj, backgroundalpha, backgroundcolor)
            isPreView && this.krpano.set(`hotspot[${PREFIXX_HS + id}].onloaded`,`do_crop_animation(128, 128, 30)`);
        }
    }


    /**
    * 隐藏所有热点及其文字标注
    * @returns {undefined} 
    */
    hideAllEntity(){
        const allHs = this.krpano.hotspot.getArray()
        const allLayer = this.krpano.layer.getArray()
        if(allHs.length > 0) allHs.forEach(hs => { hs.visible = false })
        if(allLayer.length > 0) allLayer.forEach(hs => { hs.visible = false })
    }

    /**
     * 根据热点名称删除实体（热点 + 文字标注）
     * @param {string} type 
     * @param {string} name 
     * @returns {undefined} 
     */
    delEntity(type, id){
        const prefixxMap = {
            '': PREFIXX_HS,
            'rect': PREFIXX_RECT,
            'circle': PREFIXX_CIRCLE,
            'line': PREFIXX_LINE,
            'arrow': PREFIXX_ARROW,
            'brush': PREFIXX_BRUSH,
            'text': PREFIXX_TEXT,
            'mark': PREFIXX_MARK,
            'mosaic': PREFIXX_MOSAIC,
        }
        const hs = this.krpano.hotspot.getItem(prefixxMap[type] + id)
        let tip = null
        const prefixxTipMap = {
            'rect': PREFIXX_RECT_TIP,
            'circle': PREFIXX_CIRCLE_TIP,
            'line': PREFIXX_LINE_TIP,
            'arrow': PREFIXX_ARROW_TIP 
        }
        if(['rect','circle','line','arrow'].includes(type)){
            const tipName = prefixxTipMap[type] + id
            tip = this.krpano.hotspot.getItem(tipName)
        }else if(type === ''){
            const tipName = PREFIXX_HS_TIP + id
            const hsRect = this.krpano.hotspot.getItem(COMMON_HS_EDIT_RECT)
            hsRect.visible = false
            tip = this.krpano.hotspot.getItem(tipName)
        }
        hs && this.krpano.tween(hs, {scale:0, alpha:0}, 0.5, "default", () => { hs.remove() })
        tip && this.krpano.tween(tip, {text:'',scale:0, alpha:0}, 0.5, "default", () => { tip.remove() })
    }

    /**
    * 给热点设置点击事件
    * @param {string} id - 热点id
    * @param {Function} cb - 点击热点时执行的函数
    * @param {boolean} isShowFrame - 是否显示编辑框
    * @returns {undefined} 
    */
    setHotspotClickEvent(id,cb = () => {},isShowFrame = true){
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP))
        if(!hs) return
        hs.onclick = () => {
            isShowFrame && this.setEditRect(id)
            cb(id)
        }
    }

    /**
    * 拖动编辑框热点，被框住的热点同步移动
    * @param {object} hs - krpano 热点对象。
    * @returns {undefined} 
    */
    dragHotspot(hs){
        const hsRect = this.krpano.hotspot.getItem(COMMON_HS_EDIT_RECT)
        const tipName = hs.name.replace(PREFIXX_HS, PREFIXX_HS_TIP)
        const hsTip = this.krpano.hotspot.getItem(tipName)
        if(!hsRect.dragging) return
        const hsScreen = this.krpano.spheretoscreen(hsRect.ath,hsRect.atv)
        const offsetx = this.krpano.mouse.stagex - hsScreen.x
        const offsety = this.krpano.mouse.stagey - hsScreen.y
        this.krpano.asyncloop(
            ()=>{ return hsRect.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                const pt = this.krpano.screentosphere(mousex - offsetx, mousey - offsety) 
                hsRect.ath = pt.x
                hsRect.atv = pt.y
                if(hs) {
                    hs.ath = pt.x
                    hs.atv = pt.y
                    hsTip.ath = pt.x
                    hsTip.atv = pt.y
                    this.hsDragCb && this.hsDragCb(hs.ath, hs.atv)   
                }
            }
        )
    }

    /**
    * 在热点上加上编辑框(进入编辑状态)
    * @param {string} id - 热点id。
    * @param {string} txt - 热点文本标注内容。
    * @param {boolean} isShow - 是否显示。
    * @returns {undefined} 
    */
    setEditRect(id,isShow = true){
        const existEditRect = this.krpano.hotspot.getItem(COMMON_HS_EDIT_RECT)
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP))
        const h = hs ? hs.ath : 0
        const v = hs ? hs.atv : 0
        // const rectw = Math.max((hs ? Number(hs.width) : 0) + 15,60)
        // const recth = Math.max((hs ? Number(hs.height) : 0) + 15,60)
        const rectw = 60
        const recth = 60
        if(existEditRect){
            existEditRect.setvars({
                ath: h, atv: v, visible: isShow, width: rectw, height: recth,
                ondown:() => { this.dragHotspot(hs) },
            })
        }else{
            const hsRect = this.krpano.addhotspot(COMMON_HS_EDIT_RECT)
            hsRect.setvars({ 
                type:'text', html:'', dragging: true, distorted: false, 
                width: rectw, height: recth, ath: h, atv: v, zorder:2,
                bgborder:'2 0x10a3f8 1.0', bgalpha: 0, bgroundedge:4, visible:isShow,
                ondown:() => { this.dragHotspot(hs) },
            })
        }
    }

    /**
    * 隐藏编辑框和编辑框文字标注
    */
    hideEditRectTip(){
        const hsRect = this.krpano.hotspot.getItem(COMMON_HS_EDIT_RECT)
        if(hsRect) hsRect.visible = false
    }

    /**
    * 添加热点文字标注
    * @param {string} name - 热点名称
    * @param {string} text - 热点文字标注内容
    * @param {string} cssObj - 热点文字标注css对象 如 { 'font-size:12px', 'color':'#FFFFFF' }
    * @param {number} bgalpha - 热点文字标注背景透明度
    * @param {string} bgcolor - 热点文字标注背景颜色
    * @returns {undefined} 
    */
    addTip(hsName, text = '', cssObj, bgalpha, bgcolor){
        const name = hsName.replace(PREFIXX_HS, PREFIXX_HS_TIP)
        let hsTip = this.krpano.hotspot.getItem(name)
        if(hsTip){
            hsTip.meta = { cssObj: { ...hsTip.meta.cssObj, ...cssObj } }
        }else{
            hsTip = this.krpano.addhotspot(name)
            hsTip.meta = { cssObj: { ...COMMON_HS_DEFAULT_TIP_CSS, ...cssObj } }
        }
        const hs = this.krpano.hotspot.getItem(hsName)
        const oy = -(Math.max(hs.height / 2, 30) + 20)
        
        if(bgcolor){
            bgcolor = typeof bgcolor === 'string' ? bgcolor.replace('#','0x') : bgcolor
        }else{
            bgcolor = 0x000000
        }
        const targetCssObj = { ...COMMON_HS_DEFAULT_TIP_CSS, ...cssObj }
        const css  = Object.entries(targetCssObj).map(([key, value]) => `${key}: ${value}`).join('; ')
        hsTip.setvars({
            type:'text',
            ath: hs.ath,
            atv: hs.atv,
            bgcolor,
            bgroundedge: 4, 
            bgalpha: bgalpha || .5,
            glow: 0, 
            glowcolor: 0xFFFFFF, 
            html: `<div style="${css}">${text}</div>`,
            visible: text !== '',
            oy
        })
        return hsTip
    }

    /**
    * 设置动态热点
    * @param {string} id - 热点id
    * @returns {undefined} 
    */
    setAnimateHs(id){
        console.log(id);
        console.log(PREFIXX_HS + id);
        const hs = this.krpano.hotspot.getItem(PREFIXX_HS + id)
        console.log(hs);
        this.krpano.set(`hotspot[${PREFIXX_HS + id}].onloaded`,`do_crop_animation(128, 128, 30)`);
    }
 
}

export default CommonHs 
