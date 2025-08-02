// 视图类
export class View{
    krpano
    constructor(kp){ this.krpano = kp }

    /**
    * 获取krpano view 对象
    * @returns {object}  - krpano.view 对象
    */
    getKrpView(){
        return this.krpano.view
    }

    /**
    * 获取当前视角。
    * @returns {{ hlookat: number, vlookat: number, fov: number }}  - hlookat：水平观察方向。vlookat：垂直观察方向。fov: 当前视野，即缩放数值
    */
    getCurView(){
        return { 
            hlookat: this.krpano.view.hlookat, 
            vlookat: this.krpano.view.vlookat, 
            fov: this.krpano.view.fov, 
        }
    }

    /**
    * 跳转视角
    * @param {{ hlookat: number, vlookat: number, fov: number }}  params - 视角配置。hlookat：水平观察方向。vlookat：垂直观察方向。fov: 当前视野，即缩放数值
    * @param {boolean}  isAnimate - 是否过渡动画，默认为 false
    * @returns {undefined} 
    */
    lookToView({hlookat, vlookat, fov}, isAnimate = false){
        if(isAnimate){
            this.krpano.actions.lookto(hlookat, vlookat, fov, "smooth", true, true)
        }else{
            this.krpano.view.hlookat = hlookat
            this.krpano.view.vlookat = vlookat
            this.krpano.view.fov = fov
        }
    }

    /**
    * 设置视角缩放范围
    * @param {{ fovmin:number,fovmax:number }}  params - fovmin：最小视野范围。fovmax：最大视野范围
    * @returns {undefined} 
    */
    setViewFovRange({ fovmin,fovmax }){
        if(fovmin) this.krpano.view.fovmin = fovmin
        if(fovmax) this.krpano.view.fovmax = fovmax
    }

    /**
    * 视角跳转到指定热点
    * @param {string}  name - 热点名称
    * @returns {undefined} 
    */
    lookToHs(name){
        const fov = this.krpano.view.fov
        this.krpano.actions.looktohotspot(name, fov)
    }

    /**
    * 视角跳转到指定位置
    * @param {number}  ath - 热点名称
    * @param {number}  atv - 热点名称
    * @param {number}  fov - 缩放，默认为当前大小
    * @param {Function}  cb - 视角切换结束后执行的函数
    * @returns {undefined} 
    */
    lookToPosition(ath,atv,fov,cb=()=>{}){
        if(!fov) fov = this.krpano.view.fov
        this.krpano.actions.lookto(ath,atv,fov,"smooth",true,true,()=>{cb()})
    }

    /**
    * 控制人为操作视角
    * @param {string}  type - 设置控制参数: off 或 all
    * @returns {undefined} 
    */
    userControl(type){
        this.krpano.control.usercontrol = type 
    }

    
    /**
    * 当前视角同步与目标视角同步
    * @param {object}  view - 目标视角
    * @returns {undefined} 
    */
    asyncView(view){
        this.krpano.view.syncto(view)
    }
    

    /**
    *  切换vr
    */
    toggleVRMode(){
        this.krpano.call('toggleVRMode')
    }
}

export default View 
