// 事件
class Event{
    krpano
    constructor(kp){ this.krpano = kp }

    /**
    *  注册事件
    * @param {string} eventname - 事件类型
    * @param {Function} cb - 注册的事件方法
    * @returns {Function}  - 注册的事件方法
    */
    registerEvent(eventname,cb){    
        return this.krpano.events.addListener(eventname,(e)=>{
            typeof cb === 'function' && cb(e)
        })
    }

    /**
    *  解绑事件
    * @param {string} eventname - 事件类型
    * @param {Function} cb - 解绑已注册的事件方法
    */
    removeEvent(eventname,callback){
        this.krpano.events.removeListener(eventname,callback)
    }
}

export default Event
