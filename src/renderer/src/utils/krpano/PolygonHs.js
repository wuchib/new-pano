import  CommonHs  from './CommonHs.js'
import { calcEllipseFromTwoPoints, calcArrowPoints, getDifference, createMarkHtml, createMosaicHtml, deepCopy, extractTextAndStyle  } from './assistant.js'
import config from './config.js'

const {
    SCROLL,TIP, PREFIXX_RECT, PREFIXX_CIRCLE, PREFIXX_LINE, PREFIXX_ARROW, PREFIXX_BRUSH, PREFIXX_MOSAIC, PREFIXX_TEXT, PREFIXX_MARK,
    PREFIXX_MARK_SCROLL_CONTAINER, PREFIXX_MARK_SCROLL_BOX, PREFIXX_MARK_SCROLL_CTX, PREFIXX_MARK_SCROLL_BAR_BG, PREFIXX_MARK_SCROLL_BAR
} = config()

// 多边形热点
class PolygonHs extends CommonHs{
    isMouseDown = false
    isForbit = false
    constructor(kp, hsDragCb, updateMarkWhCb, updateTipPositionCb, updateCtrlPointsCb){ 
        super()
        this.krpano = kp
        this.hsDragCb = hsDragCb
        this.updateMarkWhCb = updateMarkWhCb
        this.updateTipPositionCb = updateTipPositionCb
        this.updateCtrlPointsCb = updateCtrlPointsCb
    }

    /**
    * 设置鼠标状态（是否按下）
    * @param {boolean} bool - 鼠标状态，true： 按下， false： 抬起
    */
    setIsDown(bool){
        this.isMouseDown = bool
    }
    /**
    * 设置是否禁止绘制图形
    * @param {boolean} bool - 是否禁止绘制图形，true： 是， false： 否
    */
    setIsForbit(bool){
        this.isForbit = bool
    }

    /**
    *  绘制矩形
    * @param {{id:string, borderColor:string, borderSize:number}} 
    * - 
    * - id 矩形id
    * - borderColor 矩形的边框颜色
    * - borderSize 矩形的边框粗细
    */
    drawRect({id,borderColor,borderSize}){
        if(this.isForbit) return
        const name = PREFIXX_RECT + id
        const hs = this.krpano.addhotspot(name)
        hs.renderer = 'webgl'
        hs.polyline = true
        hs.bordercolor = Number(borderColor.replace('#','0x'))
        hs.borderwidth = borderSize
        hs.cursor  = 'move'
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y,
        }
        let lastPoint = { x: -1 , y: -1 }
        const rectPoints = new Array(10).fill(null).map((item,i)=>{
            if([1,3,5,7].includes(i)) return null
            return hs.point.createItem(`${name}_point_${i===9?i+1:i}`)
        })
        const { x, y } = this.krpano.screentosphere(firstScreenMouse.x, firstScreenMouse.y)
        rectPoints[0].ath = x
        rectPoints[0].atv = y
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true // 鼠标未移动时不执行以下代码
            if(kpX >= firstScreenMouse.x && kpY >= firstScreenMouse.y) hs.meta = { startEdge: 'lt' }
            if(kpX >= firstScreenMouse.x && kpY <= firstScreenMouse.y) hs.meta = { startEdge: 'lb' }
            if(kpX <= firstScreenMouse.x && kpY >= firstScreenMouse.y) hs.meta = { startEdge: 'rt' }
            if(kpX <= firstScreenMouse.x && kpY <= firstScreenMouse.y) hs.meta = { startEdge: 'rb' }
            const halfX = (kpX - firstScreenMouse.x) / 2
            const halfY = (kpY - firstScreenMouse.y) / 2
            const map = {
                1: { x: firstScreenMouse.x, y: firstScreenMouse.y + halfY }, 
                2: { x: firstScreenMouse.x, y: kpY },
                3: { x: firstScreenMouse.x + halfX, y: kpY },
                4: { x: kpX, y: kpY },
                5: { x: kpX, y: firstScreenMouse.y + halfY },
                6: { x: kpX, y: firstScreenMouse.y },
                7: { x: firstScreenMouse.x + halfX, y: firstScreenMouse.y },
                8: { x: firstScreenMouse.x, y: firstScreenMouse.y },
                9: { x: firstScreenMouse.x, y: firstScreenMouse.y + halfY }, 
            }
            rectPoints.forEach((p, i)=>{
                if([2,4,6,8,9].includes(i)){
                    const { x: h, y: v } = this.krpano.screentosphere(map[i].x, map[i].y)
                    p.ath = h
                    p.atv = v
                }
                if(![8,9].includes(i)){
                    if(!hs.meta.ctrlPoints) hs.meta.ctrlPoints = {}
                    if(i === 0){
                        hs.meta.ctrlPoints[i] = { ath: p.ath, atv: p.atv }
                    }else{
                        const { x: ath, y: atv } = this.krpano.screentosphere(map[i].x, map[i].y)
                        hs.meta.ctrlPoints[i] = { ath, atv }
                    }
                }
            })
            lastPoint.x = kpX
            lastPoint.y = kpY
        })
        hs.dragging = true
        hs.ondown = () => {
            this.dragPolygonHs(hs)
        }
        return { _hs: hs, _tip: null, _child: null }
    }
    
    /**
    *  绘制圆形
    * @param {{id:string, borderColor:string, borderSize:number}} 
    * - 
    * - id 圆形id
    * - borderColor 圆形的边框颜色
    * - borderSize 圆形的边框粗细
    */
    drawCircle({id,borderColor,borderSize}){
        if(this.isForbit) return
        const name = PREFIXX_CIRCLE + id
        const hs = this.krpano.addhotspot(name)
        hs.renderer = 'webgl'
        hs.polyline = true
        hs.bordercolor = Number(borderColor.replace('#','0x'))
        hs.borderwidth = borderSize
        hs.cursor  = 'move'
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y,
        }
        let lastPoint = { x: -1 , y: -1 }
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true
            if(kpX >= firstScreenMouse.x && kpY >= firstScreenMouse.y) hs.meta = { startEdge: 'lt' }
            if(kpX >= firstScreenMouse.x && kpY <= firstScreenMouse.y) hs.meta = { startEdge: 'lb' }
            if(kpX <= firstScreenMouse.x && kpY >= firstScreenMouse.y) hs.meta = { startEdge: 'rt' }
            if(kpX <= firstScreenMouse.x && kpY <= firstScreenMouse.y) hs.meta = { startEdge: 'rb' }
            const halfX = (kpX - firstScreenMouse.x) / 2
            const halfY = (kpY - firstScreenMouse.y) / 2
            const map = {
                0: { x: firstScreenMouse.x, y: firstScreenMouse.y },
                1: { x: firstScreenMouse.x, y: firstScreenMouse.y + halfY }, 
                2: { x: firstScreenMouse.x, y: kpY },
                3: { x: firstScreenMouse.x + halfX, y: kpY },
                4: { x: kpX, y: kpY },
                5: { x: kpX, y: firstScreenMouse.y + halfY },
                6: { x: kpX, y: firstScreenMouse.y },
                7: { x: firstScreenMouse.x + halfX, y: firstScreenMouse.y },
            }
            for(const i in map){
                if(!hs.meta.ctrlPoints) hs.meta.ctrlPoints = {}
                const { x:ath,y:atv } = this.krpano.screentosphere(map[i].x, map[i].y)
                hs.meta.ctrlPoints[i] = { ath, atv }
            }
            const points = calcEllipseFromTwoPoints(firstScreenMouse, { x: kpX, y: kpY }, 40)
            points.forEach((p,i)=>{
                const point = hs.point.getItem(`${PREFIXX_CIRCLE}${i}`) || hs.point.createItem(`${PREFIXX_CIRCLE}${i}`)
                const { x, y } = this.krpano.screentosphere(p.x, p.y)
                point.ath = x; point.atv = y;
            })
            lastPoint.x = kpX
            lastPoint.y = kpY
        })
        hs.dragging = true
        hs.ondown = () => {
            this.dragPolygonHs(hs)
        }
        return { _hs: hs, _tip: null }
    }

    /**
    *  绘制直线
    * @param {{id:string, borderColor:string, borderSize:number}} 
    * - 
    * - id 直线id
    * - borderColor 直线的边框颜色
    * - borderSize 直线的边框粗细
    */
    drawLine({id,borderColor,borderSize}){
        if(this.isForbit) return
        const name = PREFIXX_LINE + id
        const hs = this.krpano.addhotspot(name)
        hs.renderer = 'webgl'
        hs.polyline = true
        hs.bordercolor = Number(borderColor.replace('#','0x'))
        hs.borderwidth = borderSize
        hs.cursor  = 'move'
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y,
        }
        let lastPoint = { x: -1 , y: -1 }
        const { x, y } = this.krpano.screentosphere(firstScreenMouse.x, firstScreenMouse.y)
        const startPoint = hs.point.createItem()
        const endPoint = hs.point.createItem()
        startPoint.ath = x
        startPoint.atv = y
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true
            const { x: h, y: v } = this.krpano.screentosphere(kpX, kpY)
            endPoint.ath = h
            endPoint.atv = v
            lastPoint.x = kpX
            lastPoint.y = kpY
        })
        hs.dragging = true
        hs.ondown = () => {
            this.dragPolygonHs(hs)
        }
        return { _hs: hs, _tip: null }
    }
    
    /**
    *  绘制箭头
    * @param {{id:string, borderColor:string, borderSize:number}} 
    * - 
    * - id 箭头的名称
    * - borderColor 箭头的边框颜色
    * - borderSize 箭头的边框粗细
    */
    drawArrow({id,borderColor,borderSize}){
        if(this.isForbit) return
        const name = PREFIXX_ARROW + id
        const hs = this.krpano.addhotspot(name)
        hs.renderer = 'webgl'
        hs.polyline = true
        hs.bordercolor = Number(borderColor.replace('#','0x'))
        hs.borderwidth = borderSize
        hs.cursor  = 'move'
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y,
        }
        let lastPoint = { x: -1 , y: -1 }
        const pntA = hs.point.createItem()
        const pntE = hs.point.createItem()
        const pntC = hs.point.createItem()
        const pntB = hs.point.createItem()
        const pntD = hs.point.createItem()
        const pntF = hs.point.createItem()
        const pntA1 = hs.point.createItem()
        const { x, y } = this.krpano.screentosphere(firstScreenMouse.x, firstScreenMouse.y)
        pntA.ath = x; pntA.atv = y;
        pntA1.ath = x; pntA1.atv = y;
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true
            const { x: h, y: v } = this.krpano.screentosphere(kpX, kpY)
            const { C, D, E, F } = calcArrowPoints(firstScreenMouse.x, firstScreenMouse.y, kpX, kpY, 150, 160, 20)
            const sphereC = this.krpano.screentosphere(C.x, C.y)
            const sphereD = this.krpano.screentosphere(D.x, D.y)
            const sphereE = this.krpano.screentosphere(E.x, E.y)
            const sphereF = this.krpano.screentosphere(F.x, F.y)
            pntE.ath = sphereE.x; pntE.atv = sphereE.y;
            pntC.ath = sphereC.x; pntC.atv = sphereC.y;
            pntB.ath = h; pntB.atv = v
            pntD.ath = sphereD.x; pntD.atv = sphereD.y;
            pntF.ath = sphereF.x; pntF.atv = sphereF.y;
            lastPoint.x = kpX
            lastPoint.y = kpY
        })
        hs.dragging = true
        hs.ondown = () => {
            this.dragPolygonHs(hs)
        }

        return { _hs: hs, _tip: null }
    }

    
    /**
    *  绘制文本框
    * @param {{id:string, color:string, textContent:number}} 
    * - 
    * - id 文本框的名称
    * - color 文本颜色
    * - textContent 文本内容
    */
    drawText({id,color,textContent}){
        if(this.isForbit) return
        const name = PREFIXX_TEXT + id
        const hs = this.krpano.addhotspot(name)
        const { x, y } = this.krpano.screentosphere(this.krpano.mouse.x, this.krpano.mouse.y)
        const maxwidth = (this.krpano.stagewidth - this.krpano.mouse.x) * 2 - 100
        const textMsg = textContent.replace(/\n/g, "<br/>")
        hs.setvars({
            type: 'text',
            ath: x, atv: y,
            minwidth:100,    
            minheight: 30,        
            maxwidth,            
            bgborder: `2 ${color.replaceAll('#','0x')} 1.0 solid`,
            html: `<div style="font-size:18px;font-weight:600;color:${color}">${textMsg}</div>`,
            distorted:false,
            edge: '0.3 | 0',
            dragging: true,
            bg:false,
            meta:{ textMsg, color }
        })
        if(hs.width > hs.maxwidth){
            hs.html = `<div style="width:${hs.maxwidth}px;white-space:break-spaces;font-size:18px;font-weight:600;color:${color}">${textMsg}</div>`
        }
        hs.ondown = () => { 
            this.dragText(hs)
        }
        return { _hs: hs, _tip: null }
    }

    /**
    *  绘制文本框
    * @param {{id:string, borderSize:number, textContent:number}} 
    * - 
    * - id 文本框的名称
    * - borderSize 边框粗细
    * - textContent 文本内容
    */
    drawMark({id,borderColor,borderSize,textContent=''}){
        if(this.isForbit) return
        const name = PREFIXX_MARK + id
        const hs = this.krpano.addhotspot(name)
        hs.cursor  = 'move'
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y,
        }
        let lastPoint = { x: -1 , y: -1 }
        const { x, y } = this.krpano.screentosphere(firstScreenMouse.x, firstScreenMouse.y)
        hs.setvars({
            type:'text', html: '', enable:false, ath: x, atv: y, bgalpha:0, dragging: true,
            capturewheel:true
        })
        hs.ondown = () => { 
            this.dragMark(hs)
        }
        if(!hs.meta) hs.meta = {}
        hs.meta.ctrlPoints = {
            0:null,
            1:null,
            2:null,
            3:null,
            4:null,
            5:null,
            6:null,
            7:null,
        }
        const { scrollContainer, scrollCtx } = this.createScrollArea(name,textContent)
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true
            const diffX = kpX - firstScreenMouse.x
            const diffY = kpY - firstScreenMouse.y
            const width = Math.abs(diffX)
            const height = Math.abs(diffY)
            let startEdge
            if(diffX > 0 && diffY > 0) {startEdge = 'lt';hs.edge = 'lefttop';}
            if(diffX < 0 && diffY < 0) {startEdge = 'rb';hs.edge = 'rightbottom';}
            if(diffX > 0 && diffY < 0) {startEdge = 'lb';hs.edge = 'leftbottom';}
            if(diffX < 0 && diffY > 0) {startEdge = 'rt';hs.edge = 'righttop';}
            hs.html = createMarkHtml(width,height,borderColor,borderSize)
            scrollContainer.width = width
            scrollContainer.height = height * 0.67
            
            hs.meta.width = width
            hs.meta.height = height
            hs.meta.startEdge = startEdge
            hs.meta.textContent = textContent
            hs.meta.borderColor = borderColor
            hs.meta.borderSize = borderSize

            lastPoint.x = kpX
            lastPoint.y = kpY
        })  
        
        return { _hs: hs, _tip: null, _scrollContainer: scrollContainer, _scrollCtx: scrollCtx   }
    }

    // 将标注框锚点定位到箭头处
    setMarkEdgeToTarget(id){
        const hs = this.krpano.hotspot.getItem(PREFIXX_MARK + id)
        const { width, height } = hs.meta
        const { x: screenX, y: screenY } = this.krpano.spheretoscreen(hs.ath, hs.atv)
        const targetScreen = { x: 0, y: 0 }
        switch(hs.edge){
            case 'lefttop' :
                targetScreen.x = screenX + width * 0.3
                targetScreen.y = screenY + height
            break;
            case 'rightbottom' :
                targetScreen.x = screenX - width * 0.7
                targetScreen.y = screenY
            break;
            case 'leftbottom' :
                targetScreen.x = screenX + width * 0.3
                targetScreen.y = screenY
            break;
            case 'righttop' :
                targetScreen.x = screenX - width * 0.7
                targetScreen.y = screenY + height
            break;
        }
        hs.edge = '0.3|1.0'
        hs.meta.edge = '0.3|1.0'
        const { x: ath, y: atv } = this.krpano.screentosphere(targetScreen.x, targetScreen.y)
        hs.setvars({ ath, atv })
    }

    // 创建滚动区域容器layer
    createScrollArea(name,textContent){
        const scrollContainerName = name.replace(PREFIXX_MARK, PREFIXX_MARK_SCROLL_CONTAINER)
        const scrollBoxName = name.replace(PREFIXX_MARK, PREFIXX_MARK_SCROLL_BOX)
        const scrollCtxName = name.replace(PREFIXX_MARK, PREFIXX_MARK_SCROLL_CTX)
        const scrollBarBgName = name.replace(PREFIXX_MARK, PREFIXX_MARK_SCROLL_BAR_BG)
        const scrollBarName = name.replace(PREFIXX_MARK, PREFIXX_MARK_SCROLL_BAR)
         
        const scrollContainer = this.krpano.addlayer(scrollContainerName)
        const scrollBox = this.krpano.addlayer(scrollBoxName)
        const scrollCtx = this.krpano.addlayer(scrollCtxName)
        const scrollBarBg = this.krpano.addlayer(scrollBarBgName)
        const scrollBar = this.krpano.addlayer(scrollBarName)
        // 滚动区域最外部容器
        scrollContainer.setvars({
            type:'container',
            parent:`hotspot[${name}]`,
            edge:'lefttop',
            align:'lefttop',
            y:20,
            x:5,
            bgalpha: 0,  
            visible: true
        })
        // 滚动区域盒子
        scrollBox.setvars({
            type:'scrollarea',
            parent:`layer[${scrollContainerName}]`,
            direction:'v',
            draggable:true,
            mwheel:true,
            capturechildren:true,
            autoscrollbars:`null,${scrollBarName},10`,
            onhover_autoscrolling:false,
            width:-4,
            flowchildren:'v',
            visible: true
        })
        // 滚动内容
        const scrollCtxHtml = `<div style="padding:0 10px;word-wrap: break-word;">${textContent}</div>`
        scrollCtx.setvars({
            type:'text',
            parent:`layer[${scrollBoxName}]`,
            align:'lefttop',
            html:scrollCtxHtml,
            htmlautosize:true,
            width:'100%',
            bgalpha:0.0,
            css:'color:black; font-size:18px;',
            visible: true
        })
        // 滚动条背景盒子
        scrollBarBg.setvars({
            type:'container',
            parent:`layer[${scrollContainerName}]`,
            align:'right',
            width:16,
            height:'100%',
            visible: true
        })
        // 滚动条
        scrollBar.setvars({
            type:'container',
            parent:`layer[${scrollBarBgName}]`,
            align:'righttop',
            width:4,
            x:8,
            height:16,
            bgcolor:0xAAAAAA,
            bgalpha:1,
            bgroundedge:7,
            bgcapture:true,
            visible: true
        })
        return { scrollContainer, scrollCtx }
    }


    // 绘制马赛克 
    drawMosaic({id}){
        if(this.isForbit) return
        const name = PREFIXX_MOSAIC + id
        const hs = this.krpano.addhotspot(name)
        const firstScreenMouse = {
            x: this.krpano.mouse.x,
            y: this.krpano.mouse.y, 
        }
        let lastPoint = { x: -1 , y: -1 }
        const { x, y } = this.krpano.screentosphere(firstScreenMouse.x, firstScreenMouse.y)
        hs.setvars({
            type:'text', html: '', enable:false,
            edge:'lefttop', ath: x, atv: y, bgalpha:0, dragging: true,
            distorted:true
        })
        this.krpano.asyncloop(()=>{
            const kpX = this.krpano.mouse.x
            const kpY = this.krpano.mouse.y
            if(!this.isMouseDown) return false
            if(kpX === lastPoint.x && kpY === lastPoint.y) return true
            const diffX = kpX - firstScreenMouse.x
            const diffY = kpY - firstScreenMouse.y
            const width = Math.abs(diffX)
            const height = Math.abs(diffY)
            let startEdge
            if(diffX > 0 && diffY > 0) startEdge = 'lefttop'
            if(diffX < 0 && diffY < 0) startEdge = 'rightbottom'
            if(diffX > 0 && diffY < 0) startEdge = 'leftbottom'
            if(diffX < 0 && diffY > 0) startEdge = 'righttop'
            hs.html = createMosaicHtml(width,height)
            hs.edge = startEdge
            hs.meta = { width, height }
            lastPoint.x = kpX
            lastPoint.y = kpY
        }) 
        return { _hs: hs, _tip: null, _scrollCtx: null } 
    }
    // 绘制标注框控制点
    drawMarkControlPoints(id){
        const hsName = PREFIXX_MARK + id 
        const hs = this.krpano.hotspot.getItem(hsName)
        let positionIndexMap
        switch(hs.meta.startEdge){
            case 'lt':
                positionIndexMap = { LT:0, TOP:7, RT:6, LEFT:1, RIGHT:5, LB:2, BOTTOM:3, RB:4 }
            break;
            case 'rt':
                positionIndexMap = { LT:6, TOP:7, RT:0, LEFT:5, RIGHT:1, LB:4, BOTTOM:3, RB:2 }
            break;
            case 'lb':
                positionIndexMap = { LT:2, TOP:3, RT:4, LEFT:1, RIGHT:5, LB:0, BOTTOM:7, RB:6 }
            break;
            case 'rb':
                positionIndexMap = { LT:4, TOP:3, RT:2, LEFT:5, RIGHT:1, LB:6, BOTTOM:7, RB:0 }
            break;
        }
        const pointsCursor = {
            LT: 'nwse-resize',
            LEFT: 'ew-resize',
            LB: 'ne-resize',
            TOP: 'ns-resize',   
            BOTTOM: 'ns-resize',
            RT: 'ne-resize',
            RIGHT: 'ew-resize',
            RB: 'nwse-resize'
        }
        for(const key in positionIndexMap){
            const val = positionIndexMap[key]
            const { x, y } = this.getPointScreen(key, hs)
            const { x: ath, y: atv } = this.krpano.screentosphere(x, y)
            const ctrlPoint = this.krpano.addhotspot(`${PREFIXX_MARK}ctrl_${val}`)
            if(!hs.meta) hs.meta = {}
            if(!hs.meta.ctrlPoints) hs.meta.ctrlPoints = {}
            hs.meta.ctrlPoints[val] = { ath, atv }
            ctrlPoint.setvars({
                type:'text',
                bgroundedge:10,
                width:10,
                height:10,
                bgcolor:0xFFFFFF,
                dragging: true,
                bgborder:`1.5 0xF81010`,
                visible: true,
                ath, atv,
                cursor: pointsCursor[key],
                zorder: 2,
                // html:`<div>${val}</div>`
            })
            ctrlPoint.ondown = () => {
                let map = {}
                switch(hs.meta.startEdge){
                    case 'lt':
                        map = { LT:0, TOP:7, RT:6, LEFT:1, RIGHT:5, LB:2, BOTTOM:3, RB:4 }
                    break;
                    case 'rt':
                        map = { LT:6, TOP:7, RT:0, LEFT:5, RIGHT:1, LB:4, BOTTOM:3, RB:2 }
                    break;
                    case 'lb':
                        map = { LT:2, TOP:3, RT:4, LEFT:1, RIGHT:5, LB:0, BOTTOM:7, RB:6 }
                    break;
                    case 'rb':
                        map = { LT:4, TOP:3, RT:2, LEFT:5, RIGHT:1, LB:6, BOTTOM:7, RB:0 }
                    break;
                }
                if([map['LT'], map['LEFT'], map['TOP']].includes(val)) this.modifyMarkEdge('lt', hs)
                if([map['LB'], map['BOTTOM']].includes(val)) this.modifyMarkEdge('lb', hs)
                if([map['RT'], map['RIGHT']].includes(val)) this.modifyMarkEdge('rt', hs)
                if([map['RB']].includes(val)) this.modifyMarkEdge('rb', hs)
                this.dragRectCtrlPoints(ctrlPoint, hsName, 'mark')
            }
            ctrlPoint.onup = () => {
                this.setMarkEdgeToTarget(id)
                this.updateMarkWhCb(hs.meta.width, hs.meta.height)
                this.updateCtrlPoints(hs,'mark')
            }
        }
    }

    //  获取各个控制点的位置(标注框)
    getPointScreen(key,hs){
        const { x, y } = this.krpano.spheretoscreen(hs.ath, hs.atv)
        const { width, height } = hs.meta
        const pointMap = {
            'LT':{ x: x - width * 0.3, y: y - height },
            'LEFT':{ x: x - width * 0.3, y: y - height / 2 },
            'LB':{ x: x - width * 0.3, y: y },
            'TOP':{ x: x + width * 0.2 , y: y - height },
            'BOTTOM':{ x: x + width * 0.2, y: y },
            'RT':{ x: x + width * 0.7, y: y - height },
            'RIGHT':{ x: x + width * 0.7, y: y - height / 2 },
            'RB':{ x: x + width * 0.7, y: y },
        }
        return pointMap[key]
    }

    // 拉伸时修改标注框锚点位置
    modifyMarkEdge(edge,hs){
        const { width, height } = hs.meta
        const { x, y } = this.krpano.spheretoscreen(hs.ath, hs.atv)
        const targetScreen = { x: 0, y: 0 }
        switch(edge){
            case 'lt' :
                targetScreen.x = x + width * 0.7
                targetScreen.y = y
            break;
            case 'rb' :
                targetScreen.x = x - width * 0.3
                targetScreen.y = y - height
            break;
            case 'lb' :
                targetScreen.x = x + width * 0.7
                targetScreen.y = y - height
            break;
            case 'rt' :
                targetScreen.x = x - width * 0.3
                targetScreen.y = y
            break;
        }
        const { x: ath, y: atv } = this.krpano.screentosphere(targetScreen.x, targetScreen.y)
        hs.setvars({ ath, atv })
        const map = {
            'lt':'rightbottom',
            'rb':'lefttop',
            'lb':'righttop',
            'rt':'leftbottom',
        }
        hs.edge = map[edge]
    }
    
    /**
    *  画笔
    * @param {{id:string, borderColor:string, borderSize:number}} 
    * - 
    * - id 画笔id
    * - borderColor 画笔颜色
    * - borderSize 画笔粗细
    */
    drawBrush({id,borderColor,borderSize}){
        if(this.isForbit) return
        const name = PREFIXX_BRUSH + id
        const hs = this.krpano.addhotspot(name)
        hs.polyline = true
        hs.enabled = false
        hs.bordercolor = Number(borderColor.replace('#','0x'))
        hs.borderwidth = borderSize
        const firstPoint = hs.point.createItem()
        const { x, y } = this.krpano.screentosphere(this.krpano.mouse.x, this.krpano.mouse.y)
        firstPoint.ath = x; firstPoint.atv = y;
        let lastPoint = { x: -1 , y: -1 }
        this.krpano.asyncloop(()=>{
            if(!this.isMouseDown) return false
            if(lastPoint.x === this.krpano.mouse.x && lastPoint.y === this.krpano.mouse.y) return true
            const p = hs.point.createItem()
            const { x, y } = this.krpano.screentosphere(this.krpano.mouse.x, this.krpano.mouse.y)
            p.ath = x; p.atv = y
            lastPoint.x = this.krpano.mouse.x
            lastPoint.y = this.krpano.mouse.y
        })
        return { _hs: hs, _tip: null }
    }

    /**
    *  拖拽文本框
    * @param {any} hs - krpano 热点对象
    */
    dragText(hs){
        if(!hs.dragging) return
        const hsScreen = this.krpano.spheretoscreen(hs.ath,hs.atv)
        const offsetx = this.krpano.mouse.stagex - hsScreen.x
        const offsety = this.krpano.mouse.stagey - hsScreen.y
        this.krpano.asyncloop(
            ()=>{ return hs.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                const screenX = mousex - offsetx
                const screenY = mousey - offsety
                const pt = this.krpano.screentosphere(screenX, screenY) 
                hs.ath = pt.x
                hs.atv = pt.y
                const maxwidth = (this.krpano.stagewidth - screenX) * 2 - 100
                hs.maxwidth = maxwidth
                this.hsDragCb && this.hsDragCb(hs.ath, hs.atv)
            }
        )
    }

    /**
    *  拖拽标注框
    * @param {any} hs - krpano 热点对象
    */
    dragMark(hs){
        if(!hs.dragging) return
        const hsScreen = this.krpano.spheretoscreen(hs.ath,hs.atv)
        const markCtrlPoints = this.krpano.hotspot.getArray().filter(p=>p.name.includes(`${PREFIXX_MARK}ctrl_`))
        const ctrlPointsOffset = markCtrlPoints.map(hs=>{
            const screen = this.krpano.spheretoscreen(hs.ath,hs.atv)
            const offsetx = this.krpano.mouse.stagex - screen.x
            const offsety = this.krpano.mouse.stagey - screen.y
            return { x: offsetx, y: offsety, hs: hs }
        })
        const offsetx = this.krpano.mouse.stagex - hsScreen.x
        const offsety = this.krpano.mouse.stagey - hsScreen.y
        this.krpano.asyncloop(
            ()=>{ return hs.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                const screenX = mousex - offsetx
                const screenY = mousey - offsety
                const pt = this.krpano.screentosphere(screenX, screenY) 
                hs.ath = pt.x
                hs.atv = pt.y
                ctrlPointsOffset.forEach(hsItem=>{
                    const { x, y, hs:hsPoint } = hsItem
                    const pt = this.krpano.screentosphere(mousex - x, mousey - y) 
                    hsPoint.ath = pt.x
                    hsPoint.atv = pt.y
                })
                this.hsDragCb && this.hsDragCb(hs.ath, hs.atv)
            }
        )
    }
    updateCtrlPoints(hs,customType){
        const ctrlPoints = this.krpano.hotspot.getArray().filter(h=>h.name.includes(`${customType}_ctrl_`))
        ctrlPoints.forEach(p=>{
            const key = p.name.split('_ctrl_')[1]
            hs.meta.ctrlPoints[key] = { ath: p.ath, atv: p.atv}
        })
        this.updateCtrlPointsCb && this.updateCtrlPointsCb(hs.meta.ctrlPoints)
    }
    
    /**
    *  绘制多边形控制点
    * @param {string} id - 图形热点id
    * @param {string} customType - 图形类别
    */
    drawControlPoints(id,customType){
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP) && !item.name.includes(SCROLL))
        const hotspotName = hs.name
        if(!hs) return
        const len = hs.point.count
        const points = hs.point.getArray()
        this.krpano.hotspot.getArray().forEach(hs=>{
            if(hs.name.includes(`_ctrl_`) && !hs.name.includes(`${customType}_ctrl_`)) hs.visible = false
        })
        
        // 绘制矩形/圆形控制点
        if(customType === 'rect' || customType === 'circle'){
            const ctrlPointsObj = {}
            for(const key in hs.meta.ctrlPoints){
                const { ath, atv } = hs.meta.ctrlPoints[key]
                ctrlPointsObj[key] = { atv, ath }
            }
            for(const i in ctrlPointsObj){
                const { ath, atv } = ctrlPointsObj[i]
                const ctrlPoint = this.krpano.addhotspot(`${customType}_ctrl_${i}`)
                ctrlPoint.setvars({
                    type:'text',
                    bgroundedge:10,
                    width:10,
                    height:10,
                    bgcolor:0xFFFFFF,
                    dragging: true,
                    bgborder:`1.5 0xF81010`,
                    visible: true,
                    // html:`<div>${i}</div>`
                })
                ctrlPoint.ath = ath
                ctrlPoint.atv = atv
                ctrlPoint.ondown = () =>{
                    this.dragRectCtrlPoints(ctrlPoint,hotspotName,customType)
                }
                ctrlPoint.onup = () => {
                    this.hsDragCb && this.hsDragCb(0, 0, hs.point.getArray().map( ({ ath, atv })=>({ ath, atv }) ))
                    this.updateTipPositionCb && this.updateTipPositionCb(hs.meta.tipPosition.ath, hs.meta.tipPosition.atv) 
                    this.updateCtrlPoints(hs,customType)
                }
            }
            if(customType === 'circle') this.setDashFrame(ctrlPointsObj)
            this.setCursorInRect(hs,customType)
        }
        // 绘制线段/箭头控制点
        if(customType === 'line' || customType === 'arrow'){
            const map = {
                'line': { lastIndex: [len], firstPonitMoving: [0] },
                'arrow': { lastIndex: [1,2,4,5,len - 1], firstPonitMoving: [0, len - 1] },
            }
            for(let i = 0; i < len; i++){
                if(!map[customType]['lastIndex'].includes(i)){
                    const ctrlPoint = this.krpano.addhotspot(`${customType}_ctrl_${i}`)
                    ctrlPoint.setvars({
                        type:'text',
                        bgroundedge:10,
                        width:10,
                        height:10,
                        bgcolor:0xFFFFFF,
                        dragging: true,
                        bgborder:`1.5 0xF81010`,
                        visible: true,
                        // html:`<div>${i}</div>`
                    })
                    ctrlPoint.ath = points[i].ath
                    ctrlPoint.atv = points[i].atv
                    ctrlPoint.ondown = () => { 
                        if(customType === 'line') this.dragLineCtrlPoints(ctrlPoint,hotspotName,i === 0 ? map[customType]['firstPonitMoving'] :[i])
                        if(customType === 'arrow'){
                            if(i === 0) this.dragArrowStartEndPoint(ctrlPoint, hotspotName, map[customType]['firstPonitMoving'], 'START')
                            if(i === 3) this.dragArrowStartEndPoint(ctrlPoint, hotspotName, [3], 'END')
                        }
                    }
                    ctrlPoint.onup = () => {
                        const hs = this.krpano.hotspot.getItem(hotspotName)
                        this.hsDragCb && this.hsDragCb(0, 0, hs.point.getArray().map( ({ ath, atv })=>({ ath, atv }) ))
                        this.updateTipPositionCb && this.updateTipPositionCb(hs.meta.tipPosition.ath, hs.meta.tipPosition.atv) 
                    }
                }            
            }
        }
    }
    // 绘制圆形编辑辅助框
    setDashFrame(ctrlPointsObj){
        const dashFrameHs = this.krpano.addhotspot('dashFrame') 
        dashFrameHs.setvars({
            renderer:'webgl',
            polyline:true,
            borderwidth: 1,
            bordercolor: 0xF81010,
            visible: true,
            enabled:false,
            borderalpha:1.0
        })
        for(const i in ctrlPointsObj){
            const { ath, atv } = ctrlPointsObj[i]
            const point = dashFrameHs.point.createItem(`dashFrame_point_${i}`)
            point.ath = ath
            point.atv = atv
        }
        const point8 = dashFrameHs.point.createItem(`dashFrame_point_8`)
        point8.ath = ctrlPointsObj[0].ath
        point8.atv = ctrlPointsObj[0].atv
    }
    // 隐藏圆形编辑辅助框
    hideDashFrame(){
        const dashFrameHs = this.krpano.hotspot.getItem('dashFrame') 
        if(dashFrameHs && dashFrameHs.visible) dashFrameHs.visible = false
    }
    /**
    *  设置矩形各个控制点鼠标悬浮样式
    * @param {any} hs - krpano热点对象
    * @param {string} preffix - 图形类别
    */
    setCursorInRect(hs,preffix){
        let map = {}
        switch(hs.meta.startEdge){
            case 'lt':
            case 'rb':
                map = {
                    'ns-resize':[7,3], // ↕️
                    'ew-resize':[1,5], // ↔️
                    'nesw-resize':[6,2], // ↗
                    'nwse-resize':[0,4], // ↖️
                }
                break;
            case 'rt':
            case 'lb':
                map = {
                    'ns-resize':[3,7], // ↕️
                    'ew-resize':[1,5], // ↔️
                    'nesw-resize':[0,4], // ↗
                    'nwse-resize':[6,2], // ↖️
                }
                break;
        }
        const arr = [0,1,2,3,4,5,6,7]
        arr.forEach((ie,i)=>{
            const hsCtrl = this.krpano.hotspot.getItem(`${preffix}_ctrl_${i}`)
            for(const key in map){
                if(map[key].includes(i)) hsCtrl.cursor = key
            }
        })
    }

    /**
    *  拖拽矩形控制点
    * @param {any} hsCtrlPoint - krpano热点对象 ，此为控制点
    * @param {string} hotspotName - 当前图形名称
    * @param {string} preffix - 前缀，区分图形种类
    */
    dragRectCtrlPoints(hsCtrlPoint,hotspotName,preffix){
        if(!hsCtrlPoint.dragging) return
        const pointScreen = this.krpano.spheretoscreen(hsCtrlPoint.ath,hsCtrlPoint.atv)
        const offsetx = this.krpano.mouse.stagex - pointScreen.x
        const offsety = this.krpano.mouse.stagey - pointScreen.y
        const hs = this.krpano.hotspot.getItem(hotspotName) 
        const curI = Number(hsCtrlPoint.name.split('_')[2])
        const lastPosi = { x: this.krpano.mouse.stagex, y: this.krpano.mouse.stagey }
        let positionIndexMap = {}
        this.krpano.asyncloop(
            ()=>{ return hsCtrlPoint.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                if(mousex === lastPosi.x && mousey === lastPosi.y) return false
                lastPosi.x = mousex
                lastPosi.y = mousey
                switch(hs.meta.startEdge){
                    case 'lt':
                        positionIndexMap = { LT:0, TOP:7, RT:6, LEFT:1, RIGHT:5, LB:2, BOTTOM:3, RB:4 }
                    break;
                    case 'rt':
                        positionIndexMap = { LT:6, TOP:7, RT:0, LEFT:5, RIGHT:1, LB:4, BOTTOM:3, RB:2 }
                    break;
                    case 'lb':
                        positionIndexMap = { LT:2, TOP:3, RT:4, LEFT:1, RIGHT:5, LB:0, BOTTOM:7, RB:6 }
                    break;
                    case 'rb':
                        positionIndexMap = { LT:4, TOP:3, RT:2, LEFT:5, RIGHT:1, LB:6, BOTTOM:7, RB:0 }
                    break;
                }
                const ptScreen = { x: mousex - offsetx, y: mousey - offsety }
                const pt = this.krpano.screentosphere(ptScreen.x, ptScreen.y) 
                let edgeMap = {
                    0: 4, 4: 0,
                    2: 6, 6: 2,
                    1: 5, 5: 1,
                    3: 7, 7: 3,
                }
                let edge = this.krpano.hotspot.getItem(`${preffix}_ctrl_` + edgeMap[curI])
                const edgeScreen = this.krpano.spheretoscreen(edge.ath, edge.atv)
                
                const ctrlPointArr = new Array(8).fill(null).map((ie,i)=> this.krpano.hotspot.getItem(`${preffix}_ctrl_${i}`))
                const { LT, TOP, RT, LEFT, RIGHT, LB, BOTTOM, RB } = positionIndexMap
                const minX = Math.min(ptScreen.x, edgeScreen.x)
                const maxX = Math.max(ptScreen.x, edgeScreen.x)
                const minY = Math.min(ptScreen.y, edgeScreen.y)
                const maxY = Math.max(ptScreen.y, edgeScreen.y)
                const diffX = getDifference(edgeScreen.x, ptScreen.x)
                const diffY = getDifference(edgeScreen.y, ptScreen.y)

                const s_lt = this.krpano.screentosphere(minX, minY)
                const s_top = this.krpano.screentosphere(diffX / 2 + minX, minY)
                const s_rt = this.krpano.screentosphere(maxX, minY)
                const s_left = this.krpano.screentosphere(minX, diffY / 2 + minY)
                const s_right = this.krpano.screentosphere(maxX, diffY / 2 + minY)
                const s_lb = this.krpano.screentosphere(minX, maxY)
                const s_bottom = this.krpano.screentosphere(diffX / 2 + minX, maxY)
                const s_rb = this.krpano.screentosphere(maxX, maxY)
                const mapArr = {
                    [LT] : ()=>{ //拖拽点 0 时 123567 
                        hsCtrlPoint.ath = pt.x
                        hsCtrlPoint.atv = pt.y

                        ctrlPointArr[LB].ath = s_lb.x; ctrlPointArr[LB].atv = s_lb.y;
                        ctrlPointArr[RT].ath = s_rt.x; ctrlPointArr[RT].atv = s_rt.y
                        ctrlPointArr[LEFT].ath = s_left.x; ctrlPointArr[LEFT].atv = s_left.y
                        ctrlPointArr[BOTTOM].ath = s_bottom.x; ctrlPointArr[BOTTOM].atv = s_bottom.y
                        ctrlPointArr[RIGHT].ath = s_right.x; ctrlPointArr[RIGHT].atv = s_right.y
                        ctrlPointArr[TOP].ath = s_top.x; ctrlPointArr[TOP].atv = s_top.y

                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }
                        if(ptScreen.x > edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                        }
                        if(ptScreen.x < edgeScreen.x && ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'righttop'; return}
                        }
                        if(ptScreen.x > edgeScreen.x && ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                        }
                        
                    },
                    [LEFT]: ()=>{ //拖拽点 1 时 0237 
                        const screenRY = this.krpano.spheretoscreen(ctrlPointArr[RIGHT].ath, ctrlPointArr[RIGHT].atv).y
                        hsCtrlPoint.atv = this.krpano.screentosphere(ptScreen.x, screenRY).y
                        hsCtrlPoint.ath = pt.x

                        const screenRtY = this.krpano.spheretoscreen(ctrlPointArr[RT].ath, ctrlPointArr[RT].atv).y
                        const screenRbY = this.krpano.spheretoscreen(ctrlPointArr[RB].ath, ctrlPointArr[RB].atv).y
                        const halfX = (edgeScreen.x - ptScreen.x) / 2 + ptScreen.x


                        const ltSphere = this.krpano.screentosphere(ptScreen.x, screenRtY)
                        const lbSphere = this.krpano.screentosphere(ptScreen.x, screenRbY)
                        const tSphere = this.krpano.screentosphere(halfX, screenRtY)
                        const bSphere = this.krpano.screentosphere(halfX, screenRbY)

                        ctrlPointArr[LT].ath = ltSphere.x; ctrlPointArr[LT].atv = ltSphere.y
                        ctrlPointArr[LB].ath = lbSphere.x; ctrlPointArr[LB].atv = lbSphere.y
                        ctrlPointArr[TOP].ath = tSphere.x; ctrlPointArr[TOP].atv = tSphere.y
                        ctrlPointArr[BOTTOM].ath = bSphere.x; ctrlPointArr[BOTTOM].atv = bSphere.y

                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                        }

                        if(ptScreen.x > edgeScreen.x){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt'; if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt'; if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb'; if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb'; if(preffix === 'mark') hs.edge = 'leftbottom'; return}
                        }
                        
                    },
                    [LB]:()=>{ //拖拽点 2 时 013457 todo
                        hsCtrlPoint.ath = pt.x
                        hsCtrlPoint.atv = pt.y

                        ctrlPointArr[LT].ath = s_lt.x; ctrlPointArr[LT].atv = s_lt.y; 
                        ctrlPointArr[RB].ath = s_rb.x; ctrlPointArr[RB].atv = s_rb.y; 
                        ctrlPointArr[BOTTOM].ath = s_bottom.x; ctrlPointArr[BOTTOM].atv = s_bottom.y; 
                        ctrlPointArr[TOP].ath = s_top.x; ctrlPointArr[TOP].atv = s_top.y; 
                        ctrlPointArr[LEFT].ath = s_left.x; ctrlPointArr[LEFT].atv = s_left.y; 
                        ctrlPointArr[RIGHT].ath = s_right.x; ctrlPointArr[RIGHT].atv = s_right.y; 

                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }

                        if(ptScreen.x > edgeScreen.x && ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'lefttop'; return}
                        }
                        if(ptScreen.x < edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                        }
                        if(ptScreen.x > edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                        }
                        
                    }, 
                    [BOTTOM]:()=>{ //拖拽点 3 时 1245
                        const screenTX = this.krpano.spheretoscreen(ctrlPointArr[TOP].ath, ctrlPointArr[TOP].atv).x
                        hsCtrlPoint.ath = this.krpano.screentosphere(screenTX, ptScreen.y).x
                        hsCtrlPoint.atv = pt.y

                        const screenLtX = this.krpano.spheretoscreen(ctrlPointArr[LT].ath, ctrlPointArr[LT].atv).x
                        const screenRtX = this.krpano.spheretoscreen(ctrlPointArr[RT].ath, ctrlPointArr[RT].atv).x
                        const halfY = (ptScreen.y - edgeScreen.y) / 2 + edgeScreen.y

                        const lbSphere = this.krpano.screentosphere(screenLtX,ptScreen.y)
                        const rbSphere = this.krpano.screentosphere(screenRtX,ptScreen.y)
                        const lSphere = this.krpano.screentosphere(screenLtX, halfY)
                        const rSphere = this.krpano.screentosphere(screenRtX, halfY)

                        ctrlPointArr[LB].ath = lbSphere.x; ctrlPointArr[LB].atv = lbSphere.y
                        ctrlPointArr[RB].ath = rbSphere.x; ctrlPointArr[RB].atv = rbSphere.y
                        ctrlPointArr[LEFT].ath = lSphere.x; ctrlPointArr[LEFT].atv = lSphere.y
                        ctrlPointArr[RIGHT].ath = rSphere.x; ctrlPointArr[RIGHT].atv = rSphere.y

                        if(preffix === 'mark'){
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }

                        if(ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                        }

                        
                    },
                    [RB]:()=>{ //拖拽点 4 时 123567 todo
                        hsCtrlPoint.ath = pt.x
                        hsCtrlPoint.atv = pt.y

                        ctrlPointArr[RT].ath = s_rt.x; ctrlPointArr[RT].atv = s_rt.y;
                        ctrlPointArr[LB].ath = s_lb.x; ctrlPointArr[LB].atv = s_lb.y;
                        ctrlPointArr[BOTTOM].ath = s_bottom.x; ctrlPointArr[BOTTOM].atv = s_bottom.y;
                        ctrlPointArr[TOP].ath = s_top.x; ctrlPointArr[TOP].atv = s_top.y;
                        ctrlPointArr[LEFT].ath = s_left.x; ctrlPointArr[LEFT].atv = s_left.y;
                        ctrlPointArr[RIGHT].ath = s_right.x; ctrlPointArr[RIGHT].atv = s_right.y;

                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }
                        if(ptScreen.x <= edgeScreen.x && ptScreen.y >= edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'righttop'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'righttop'; return}
                        }
                        if(ptScreen.x > edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'leftbottom';return}
                        }
                        if(ptScreen.x < edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'rightbottom'; return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'rightbottom'; return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'rightbottom'; return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'rightbottom'; return}
                        }
                        
                    },
                    [RIGHT]:()=>{ //拖拽点 5 时 3467
                        const screenLY = this.krpano.spheretoscreen(ctrlPointArr[LEFT].ath, ctrlPointArr[LEFT].atv).y
                        hsCtrlPoint.atv = this.krpano.screentosphere(ptScreen.x, screenLY).y
                        hsCtrlPoint.ath = pt.x

                        const screenLtY = this.krpano.spheretoscreen(ctrlPointArr[LT].ath, ctrlPointArr[LT].atv).y
                        const screenLbY = this.krpano.spheretoscreen(ctrlPointArr[LB].ath, ctrlPointArr[LB].atv).y
                        const halfX = (ptScreen.x - edgeScreen.x) / 2 + edgeScreen.x

                        const rtSphere = this.krpano.screentosphere(ptScreen.x, screenLtY)
                        const rbSphere = this.krpano.screentosphere(ptScreen.x, screenLbY)
                        const tSphere = this.krpano.screentosphere(halfX, screenLtY)
                        const bSphere = this.krpano.screentosphere(halfX, screenLbY)

                        ctrlPointArr[RT].ath = rtSphere.x; ctrlPointArr[RT].atv = rtSphere.y
                        ctrlPointArr[RB].ath = rbSphere.x; ctrlPointArr[RB].atv = rbSphere.y
                        ctrlPointArr[TOP].ath = tSphere.x; ctrlPointArr[TOP].atv = tSphere.y
                        ctrlPointArr[BOTTOM].ath = bSphere.x; ctrlPointArr[BOTTOM].atv = bSphere.y
                        

                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                        }

                        if(ptScreen.x < edgeScreen.x){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                        }
                        
                    },
                    [RT]:()=>{ //拖拽点 6 时 013457 todo
                        hsCtrlPoint.ath = pt.x
                        hsCtrlPoint.atv = pt.y

                        ctrlPointArr[RB].ath = s_rb.x; ctrlPointArr[RB].atv = s_rb.y;
                        ctrlPointArr[LT].ath = s_lt.x; ctrlPointArr[LT].atv = s_lt.y;
                        ctrlPointArr[BOTTOM].ath = s_bottom.x; ctrlPointArr[BOTTOM].atv = s_bottom.y;
                        ctrlPointArr[TOP].ath = s_top.x; ctrlPointArr[TOP].atv = s_top.y;
                        ctrlPointArr[LEFT].ath = s_left.x; ctrlPointArr[LEFT].atv = s_left.y;
                        ctrlPointArr[RIGHT].ath = s_right.x; ctrlPointArr[RIGHT].atv = s_right.y;
                        if(preffix === 'mark'){
                            hs.meta.width = getDifference(ptScreen.x, edgeScreen.x)
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }

                        if(ptScreen.x < edgeScreen.x && ptScreen.y < edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'rightbottom';return}
                        }
                        if(ptScreen.x > edgeScreen.x && ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'lefttop';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'lefttop';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'lefttop';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'lefttop';return}
                        }
                        if(ptScreen.x < edgeScreen.x && ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'righttop';return}
                        }
                        
                    },
                    [TOP]:()=>{ //拖拽点 7 时 0156
                        const screenBX = this.krpano.spheretoscreen(ctrlPointArr[BOTTOM].ath, ctrlPointArr[BOTTOM].atv).x
                        hsCtrlPoint.ath = this.krpano.screentosphere(screenBX, ptScreen.y).x
                        hsCtrlPoint.atv = pt.y

                        const screenLbX = this.krpano.spheretoscreen(ctrlPointArr[LB].ath, ctrlPointArr[LB].atv).x
                        const screenRbX = this.krpano.spheretoscreen(ctrlPointArr[RB].ath, ctrlPointArr[RB].atv).x
                        const halfY = (edgeScreen.y - ptScreen.y) / 2 + ptScreen.y

                        const ltSphere = this.krpano.screentosphere(screenLbX,ptScreen.y)
                        const rtSphere = this.krpano.screentosphere(screenRbX,ptScreen.y)
                        const lSphere = this.krpano.screentosphere(screenLbX, halfY)
                        const rSphere = this.krpano.screentosphere(screenRbX, halfY)

                        ctrlPointArr[LT].ath = ltSphere.x; ctrlPointArr[LT].atv = ltSphere.y
                        ctrlPointArr[RT].ath = rtSphere.x; ctrlPointArr[RT].atv = rtSphere.y
                        ctrlPointArr[LEFT].ath = lSphere.x; ctrlPointArr[LEFT].atv = lSphere.y
                        ctrlPointArr[RIGHT].ath = rSphere.x; ctrlPointArr[RIGHT].atv = rSphere.y

                        if(preffix === 'mark'){
                            hs.meta.height = getDifference(ptScreen.y, edgeScreen.y)
                        }

                        if(ptScreen.y > edgeScreen.y){
                            if(hs.meta.startEdge == 'lt') {hs.meta.startEdge = 'lb';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'rt') {hs.meta.startEdge = 'rb';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'lb') {hs.meta.startEdge = 'lt';if(preffix === 'mark') hs.edge = 'righttop';return}
                            if(hs.meta.startEdge == 'rb') {hs.meta.startEdge = 'rt';if(preffix === 'mark') hs.edge = 'righttop';return}
                        }
                    },
                }
                for(const edgeKey in positionIndexMap){
                    const val = positionIndexMap[edgeKey]
                    const pCtrl = this.krpano.hotspot.getItem(`${preffix}_ctrl_${val}`)
                    if(edgeKey === 'LT') pCtrl.cursor = 'nwse-resize'
                    if(edgeKey === 'TOP') pCtrl.cursor = 'ns-resize'
                    if(edgeKey === 'RT') pCtrl.cursor = 'nesw-resize'
                    if(edgeKey === 'LEFT') pCtrl.cursor = 'ew-resize'
                    if(edgeKey === 'RIGHT') pCtrl.cursor = 'ew-resize'
                    if(edgeKey === 'LB') pCtrl.cursor = 'nesw-resize'
                    if(edgeKey === 'BOTTOM') pCtrl.cursor = 'ns-resize'
                    if(edgeKey === 'RB') pCtrl.cursor = 'nwse-resize'
                }
                mapArr[curI]()
                if(preffix === 'rect'){
                    ctrlPointArr.forEach((cp,i)=>{
                        if([0,2,4,6].includes(i)){
                            const point = hs.point.getItem(`${hotspotName}_point_${i}`) 
                            point.ath = cp.ath
                            point.atv = cp.atv
                        }
                        hs.meta.ctrlPoints[i] = { ath: cp.ath, atv: cp.atv }
                    })
                    const point8 = hs.point.getItem(`${hotspotName}_point_8`)
                    const point10 = hs.point.getItem(`${hotspotName}_point_10`)
                    point8.ath = ctrlPointArr[0].ath
                    point8.atv = ctrlPointArr[0].atv
                    point10.ath = ctrlPointArr[1].ath
                    point10.atv = ctrlPointArr[1].atv
                    this.editTipPosition(hotspotName,preffix)
                }
                if(preffix === 'circle'){
                    const dashFrameHs = this.krpano.hotspot.getItem('dashFrame')
                    ctrlPointArr.forEach((cp,i)=>{
                        hs.meta.ctrlPoints[i] = { ath: cp.ath, atv: cp.atv }
                        const framePoint = dashFrameHs.point.getItem(`dashFrame_point_${i}`)
                        framePoint.ath = cp.ath
                        framePoint.atv = cp.atv
                    })
                    const framePoint8 = dashFrameHs.point.getItem(`dashFrame_point_8`)
                    framePoint8.ath = ctrlPointArr[0].ath
                    framePoint8.atv = ctrlPointArr[0].atv
                    const ltScreen = this.krpano.spheretoscreen(ctrlPointArr[LT].ath, ctrlPointArr[LT].atv)
                    const rbScreen = this.krpano.spheretoscreen(ctrlPointArr[RB].ath, ctrlPointArr[RB].atv)
                    const points = calcEllipseFromTwoPoints(ltScreen, rbScreen, 40)
                    points.forEach((p,i)=>{
                        const point = hs.point.getItem(`${PREFIXX_CIRCLE}${i}`)
                        const { x, y } = this.krpano.screentosphere(p.x, p.y)
                        point.ath = x; point.atv = y;
                    })
                    this.editTipPosition(hotspotName,preffix)
                }
                if(preffix === 'mark'){
                    const { width, height, borderColor, borderSize, textContent } = hs.meta
                    hs.width = width
                    hs.height = height
                    hs.html = createMarkHtml(width,height,borderColor,borderSize)
                    const { scrollContainer } = this.createScrollArea(hotspotName,textContent)
                    scrollContainer.width = width
                    scrollContainer.height = height * 0.67
                }
            }
        )
    } 

    /**
    *  拖拽直线控制点
    * @param {any} hsCtrlPoint - krpano热点对象 ，此为控制点
    * @param {string} hotspotName - 当前图形名称
    * @param {Array<number>} pIndexArr - 当前图形需要跟随控制点移动的点的索引列表
    */
    dragLineCtrlPoints(hsCtrlPoint,hotspotName,pIndexArr){
        if(!hsCtrlPoint.dragging) return
        const pointScreen = this.krpano.spheretoscreen(hsCtrlPoint.ath,hsCtrlPoint.atv)
        const offsetx = this.krpano.mouse.stagex - pointScreen.x
        const offsety = this.krpano.mouse.stagey - pointScreen.y
        const hs = this.krpano.hotspot.getItem(hotspotName) 
        const hsPoints = pIndexArr.map(i=>hs.point.getArray()[i])
        this.krpano.asyncloop(
            ()=>{ return hsCtrlPoint.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                const pt = this.krpano.screentosphere(mousex - offsetx, mousey - offsety) 
                hsCtrlPoint.ath = pt.x
                hsCtrlPoint.atv = pt.y
                hsPoints.forEach(p=>{
                    const hsP = this.krpano.screentosphere(mousex - offsetx, mousey - offsety) 
                    p.ath = hsP.x
                    p.atv = hsP.y
                })
                this.editTipPosition(hotspotName,'line')
            }
        )
    }
    
    /**
    *  拖拽箭头控制点
    * @param {any} hsCtrlPoint - krpano热点对象 ，此为控制点
    * @param {string} hotspotName - 当前图形名称
    * @param {Array<number>} pIndexArr - 当前图形需要跟随控制点移动的点的索引列表
    * @param {'START' | 'END'} type - 控制点类型 箭头头部或尾部
    */
    dragArrowStartEndPoint(hsCtrlPoint, hotspotName, pIndexArr, type){
        if(!hsCtrlPoint.dragging) return
        const pointScreen = this.krpano.spheretoscreen(hsCtrlPoint.ath,hsCtrlPoint.atv)
        const offsetx = this.krpano.mouse.stagex - pointScreen.x
        const offsety = this.krpano.mouse.stagey - pointScreen.y
        const hs = this.krpano.hotspot.getItem(hotspotName) 
        const pointArr = hs.point.getArray()
        const hsPoints = pIndexArr.map(i=>pointArr[i])
        const theOtherEnd = type === 'START' ? pointArr[3] : pointArr[0]
        const screenEndPoint = this.krpano.spheretoscreen(theOtherEnd.ath, theOtherEnd.atv)
        this.krpano.asyncloop(
            ()=>{ return hsCtrlPoint.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                const pt = this.krpano.screentosphere(mousex - offsetx, mousey - offsety) 
                hsCtrlPoint.ath = pt.x
                hsCtrlPoint.atv = pt.y
                hsPoints.forEach(p=>{
                    const hsP = this.krpano.screentosphere(mousex - offsetx, mousey - offsety) 
                    p.ath = hsP.x
                    p.atv = hsP.y
                })
                const { C, D, E, F } = calcArrowPoints(
                    type === 'START' ? mousex - offsetx : screenEndPoint.x, 
                    type === 'START' ? mousey - offsety : screenEndPoint.y, 
                    type === 'START' ? screenEndPoint.x : mousex - offsetx, 
                    type === 'START' ? screenEndPoint.y : mousey - offsety, 
                    150, 160, 20
                )
                const sphereC = this.krpano.screentosphere(C.x, C.y)
                const sphereD = this.krpano.screentosphere(D.x, D.y)
                const sphereE = this.krpano.screentosphere(E.x, E.y)
                const sphereF = this.krpano.screentosphere(F.x, F.y)
                pointArr[1].ath = sphereE.x; pointArr[1].atv = sphereE.y;
                pointArr[2].ath = sphereC.x; pointArr[2].atv = sphereC.y;
                pointArr[4].ath = sphereD.x; pointArr[4].atv = sphereD.y;
                pointArr[5].ath = sphereF.x; pointArr[5].atv = sphereF.y;
                this.editTipPosition(hotspotName,'arrow')
            }
        )
    }
    /**
    *  拖拽图形
    * @param {any} hs - krpano热点对象 ，此为多边形热点
    */
    dragPolygonHs(hs){
        if(!hs.dragging) return
        const hsPoints = hs.point.getArray()
        const preffix = hs.name.split('_')[0]
        const hsPointsOffset = hsPoints.map(p => {
            const screen = this.krpano.spheretoscreen(p.ath,p.atv)
            const offsetx = this.krpano.mouse.stagex - screen.x
            const offsety = this.krpano.mouse.stagey - screen.y
            return { x: offsetx, y: offsety, point: p }
        })
        const ctrlPoints = this.krpano.hotspot.getArray().filter(hs => hs.name.includes(`${preffix}_ctrl_`)) 
        const ctrlPointsOffset = ctrlPoints.map(hs=>{
            const screen = this.krpano.spheretoscreen(hs.ath,hs.atv)
            const offsetx = this.krpano.mouse.stagex - screen.x
            const offsety = this.krpano.mouse.stagey - screen.y
            return { x: offsetx, y: offsety, hs: hs }
        }) 
        this.krpano.asyncloop(
            ()=>{ return hs.pressed },
            ()=>{ 
                const mousex = this.krpano.mouse.stagex
                const mousey = this.krpano.mouse.stagey
                hsPointsOffset.forEach(pItem=>{
                    const { x, y, point } = pItem
                    const pt = this.krpano.screentosphere(mousex - x, mousey - y) 
                    point.ath = pt.x
                    point.atv = pt.y
                })
                ctrlPointsOffset.forEach(hsItem=>{
                    const { x, y, hs:hsPoint } = hsItem
                    const key = Number(hsPoint.name.split(`${preffix}_ctrl_`)[1])
                    const pt = this.krpano.screentosphere(mousex - x, mousey - y) 
                    hsPoint.ath = pt.x
                    hsPoint.atv = pt.y
                    if(['circle','rect'].includes(preffix)) hs.meta.ctrlPoints[key] = { ath: pt.x, atv: pt.y }
                })
                
                this.hsDragCb && this.hsDragCb(0, 0, hs.point.getArray().map( ({ ath, atv })=>({ ath, atv }) ))
                this.updateTipPositionCb && this.updateTipPositionCb(hs.meta.tipPosition.ath, hs.meta.tipPosition.atv) 
                this.editTipPosition(hs.name, preffix)
            }
        )
    }
    
    /**
    *  设置图形上方文字标注
    * @param {string} id - 多边形热点id
    * @param {{ title:string, titleFontSize:string }} 
    * @param {boolean} isPreView - 是否在预览状态下
    * - 
    * - title 文字标注内容
    * - titleFontSize 文字标注字体大小
    */
    setPolygonTip(id, { title, titleFontSize, tipPosition },customType){
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP) && !item.name.includes(SCROLL))
        const hsName = hs.name
        if(!hs) return
        const hsTip = this.krpano.addhotspot(`${TIP}${hsName}`)
        if(!tipPosition || tipPosition.ath === null || tipPosition.atv === null) tipPosition = this.calcTipPosition(hsName, customType)
        hsTip.setvars({
            type:'text',
            bgroundedge:4,
            bgcolor:0x000000,
            bgalpha: .5,
            enable: false,
            ath: tipPosition.ath,
            atv: tipPosition.atv,
            visible: false,
            oy: -20
        })
        if(!hsTip.html) {
            hsTip.html = `<div style="box-sizing:border-box;padding:5px;font-size:${titleFontSize}px;color:#ffffff">${title}</div>`
            hsTip.visible = title !== '' && title !== undefined && title !== null
        }else{
            const htmlMsg = extractTextAndStyle(hsTip.html)
            if(htmlMsg.text!=='') hsTip.visible = true 
        }
        return hsTip
    }

    /**
    *  更新标注位置信息
    * @param {string} hsName - 图形热点名称
    * @param {'rect' | 'circle' | 'line' | 'arrow'} customType - 图形类别
    */
    editTipPosition(hsName, customType){
        const hsTip = this.krpano.hotspot.getItem(`${TIP}${hsName}`)
        if(!hsTip) return
        const tipPosition = this.calcTipPosition(hsName,customType)
        hsTip.ath = tipPosition.ath
        hsTip.atv = tipPosition.atv
    }

    /**
    *  隐藏控制点
    */
    hideAllCtrlPoints(){
        this.krpano.hotspot.getArray().forEach(hs=>{
            if(hs.name.includes('ctrl_')) hs.visible = false
        })
        this.hideDashFrame()
    }
    
    /**
    *  设置多边形热点点击事件
    * @param {string} id - 多边形热点id
    * @param {Function} cb - 点击时执行的函数
    */
    setPolygonClickEvent(id, cb){
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP) && !item.name.includes(SCROLL))
        hs.onclick = () =>{
            this.clickEventInPolygon(id)
            cb && cb()
        }
    }
    /**
    *  点击多边形热点的事件
    * @param {string} id - 多边形热点id
    */
    clickEventInPolygon(id){
        const hs = this.krpano.hotspot.getArray().find(item => item.name.includes(id) && !item.name.includes(TIP) && !item.name.includes(SCROLL))
        if(hs.name.includes('brush','mosaic')) return
        hs.dragging = true
        hs.ondown = () => { 
            if(hs.name.includes('text')) this.dragText(hs)
            if(/rect|circle|line|arrow/.test(hs.name)) this.dragPolygonHs(hs)
            if(hs.name.includes('mark')) this.dragMark(hs)
        }
    }
    
    /**
    *  加载多边形
    * @param {{ id:string, borderColor:string, borderSize:string, points:Array, title:string, titleFontSize:number, krpPosition:object, textContent:string, startEdge:string, ctrlPoints:Array, customType:string, wdith:string, height:string, tipPosition: object }} config
    * - 
    * - id 自定义图形id
    * - borderColor 边框颜色
    * - borderSize 边框粗细
    * - points 点位置信息
    * - title 是文字标注内容
    * - titleFontSize 文字标注字体
    * - krpPosition 位置
    * - textContent 文本框内容
    * - startEdge 初始锚点
    * - ctrlPoints 控制点
    * - customType 图形种类
    * - width 宽（标注框特有）
    * - height 高（标注框特有）
    * - tipPosition 文字标注框的位置信息
    * */
    loadPolygon(config){
        const { id, borderColor, borderSize, points, title, titleFontSize, krpPosition, textContent, startEdge, ctrlPoints, customType,width, height, tipPosition } = config
        const preffixMap = {
            'rect': PREFIXX_RECT,
            'circle': PREFIXX_CIRCLE,
            'line': PREFIXX_LINE,
            'arrow': PREFIXX_ARROW,
            'brush': PREFIXX_BRUSH,
            'mark': PREFIXX_MARK,
            'text': PREFIXX_TEXT,
            'mosaic': PREFIXX_MOSAIC,
        }
        const name = preffixMap[customType] + id
        const hs = this.krpano.addhotspot(name)
        hs.visible = true
        hs.meta = { 
            startEdge: deepCopy(startEdge),
            ctrlPoints: deepCopy(ctrlPoints)
        }
        // 多边形热点类型的图形 （矩形、圆、线段、箭头、画笔）
        if(['rect','circle','line','arrow','brush'].includes(customType)){
            hs.polyline = true
            hs.borderwidth = borderSize
            hs.bordercolor = Number(borderColor.replaceAll('#', '0x'))
            const oldPoints = hs.point.getArray()
            if (oldPoints.length > 0) {
                oldPoints.forEach((p, i) => {
                    p.ath = points[i].ath
                    p.atv = points[i].atv
                })
            } else {
                points.forEach((p,i) => {
                    const pointNameMap = {
                        'rect': `${name}_point_${i*2}`,
                        'circle': `${PREFIXX_CIRCLE}${i}`,
                        'line' : `line_${i}`,
                        'arrow': `arrow_${i}`,
                        'brush': `brush_${i}`,
                    }
                    const point = hs.point.createItem(pointNameMap[customType])
                    point.ath = p.ath;
                    point.atv = p.atv;
                })
            }
            if(customType!=='brush'){
                this.setPolygonTip(id, { title, titleFontSize, tipPosition },customType)
                if(!hs.meta) hs.meta = {}
                hs.meta.tipPosition = deepCopy(tipPosition)
            }
        }
        // 标注框
        if(customType === 'mark'){
            hs.setvars({
                type:'text', 
                ath: krpPosition.ath,
                atv: krpPosition.atv,
                edge:'0.3|1.0',  
                bgalpha:0,
                capturewheel:true,
                meta:{ width, height, startEdge, borderColor, borderSize, textContent }
            })
            hs.html = createMarkHtml(width,height,borderColor,borderSize)
            const { scrollContainer } = this.createScrollArea(name,textContent)
            scrollContainer.width = width
            scrollContainer.height = height * 0.67
        }
        // 文本框
        if(customType === 'text'){
            hs.ath = krpPosition.ath
            hs.atv = krpPosition.atv
            hs.type = 'text'
            hs.html = `<div style="font-size:18px;font-weight:600;color:${borderColor}">${textContent}</div>`
            hs.bg = false
        }
        // 马赛克
        if(customType === 'mosaic'){
            hs.setvars({
                type:'text', 
                ath: krpPosition.ath,
                atv: krpPosition.atv,
                edge:'lefttop', 
                bgalpha:0, 
                distorted:true
            })
            hs.html = createMosaicHtml(width,height)
        }
    }
    /**
    *  计算图形文字气泡框的位置
    * @param {string} hsName - 图形热点名称
    * @param {'rect' | 'circle' | 'line' | 'arrow'} customType - 图形类别
    */
    calcTipPosition(hsName, type){
        const hs = this.krpano.hotspot.getItem(hsName)
        let ath, atv
        let x,y = Infinity
        if(['rect','circle'].includes(type)){
            const ctrlPoints = hs.meta.ctrlPoints
            let maxScreenX = -Infinity
            let minScreenX = Infinity
            for(const key in ctrlPoints){
                const p = ctrlPoints[key]
                const screenP = this.krpano.spheretoscreen(p.ath, p.atv)
                maxScreenX = Math.max(maxScreenX, screenP.x)
                minScreenX = Math.min(minScreenX, screenP.x)
                x = minScreenX + (maxScreenX - minScreenX) / 2
                y = Math.min(y, screenP.y)
            }
        }
        if(['arrow','line'].includes(type)){
            const secondIndex = type === 'line' ? 1 : 3 
            const points = hs.point.getArray()
            const screenP0 = this.krpano.spheretoscreen(points[0].ath, points[0].atv)
            const screenP1 = this.krpano.spheretoscreen(points[secondIndex].ath, points[secondIndex].atv)
            const maxScreenX = Math.max(screenP0.x, screenP1.x)
            const minScreenX = Math.min(screenP0.x, screenP1.x)
            x = minScreenX + (maxScreenX - minScreenX) / 2
            y = Math.min(screenP0.y, screenP1.y)
        }
        const sphereP = this.krpano.screentosphere(x, y)
        ath = sphereP.x
        atv = sphereP.y
        if(!hs.meta) hs.meta = {}
        hs.meta.tipPosition = { ath, atv }
        return { ath, atv }
    }
}

export default PolygonHs 
