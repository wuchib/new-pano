import Scene from './Scene.js'
import View from './View.js'
import CommonHs from './CommonHs.js'
import PolygonHs from './PolygonHs.js'
import Event from './Event.js'
import config from './config.js'

const { TEMPLATE_XML } = config()
import { hideContextmenu } from './assistant.js'

/**
* 初始化全景。
* @param {string} target - dom 节点的 id 值。
* @returns {Promise} - Promise<krpano> 返回一个 Promise, 成功状态为 krpano 接口
*/
function initPanorama(target) {
    return new Promise((resolve, reject) => {
        if (typeof window.embedpano === 'undefined') {
            console.error('😿没有krpano viewer, 请先引入krpano.js');
            reject(new Error('krpano viewer library is not loaded.'));
            return;
        }
        window.embedpano({
          xml:TEMPLATE_XML,
          html5: 'auto',
          target,
          id: 'krpanoSWFObject',
          consolelog: true,
          initvars:{ showerrors:false },
          passQueryParameters: true,
          wmode: 'window',
          bgcolor: "#313742",
          onready: function (krpanoInstance) {
              console.log('%c😼krpano全景框架准备就绪!','color:#67C23A;font-weight: 600;');
              hideContextmenu()
              resolve(krpanoInstance);
          },
          onerror: function (message) {
              console.log(`%c😿krpano加载失败: ${message}`, 'color:#F56C6C; font-weight: 600;');
              reject(new Error(`krpano failed to load: ${message}`));
          },
        })
    });
}

export default { 
    initPanorama,
    Scene,
    View,
    CommonHs,
    PolygonHs,
    Event,
} 
