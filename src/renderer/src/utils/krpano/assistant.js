// 求两数之差 
export function getDifference(a, b) {
  return Math.max(a, b) - Math.min(a, b);
}

export function deepCopy(obj) {
let newobj = null // 接受拷贝的新对象
if (typeof (obj) == 'object' && obj !== null) { // 判断是否是引用类型
  newobj = obj instanceof Array ? [] : {} // 判断是数组还是对象
  for (var i in obj) {
    newobj[i] = deepCopy(obj[i]) // 判断下一级是否还是引用类型
  }
} else {
  newobj = obj
}
return newobj
}

/**
* 通过屏幕两个点坐标构建近似椭圆
*
* @param {{x: number, y: number}} pointA - 第一个点的坐标。
* @param {{x: number, y: number}} pointB - 第二个点的坐标。
* @param {number} numPoints - 构建近似椭圆的点数 。
* @returns {Array} 返回所有点组成的数组。
* 
*/
export function calcEllipseFromTwoPoints(pointA, pointB, numPoints = 40) {
// 计算椭圆中心
const centerX = (pointA.x + pointB.x) / 2;
const centerY = (pointA.y + pointB.y) / 2;
// 计算长轴和短轴半径
const radiusX = Math.abs(pointA.x - pointB.x) / 2;
const radiusY = Math.abs(pointA.y - pointB.y) / 2;
// 计算椭圆上点的坐标
const points = [];
for (let i = 0; i < numPoints; i++) {
  const angle = (2 * Math.PI / numPoints) * i;
  const x = centerX + radiusX * Math.cos(angle);
  const y = centerY + radiusY * Math.sin(angle);
  points.push({ x, y });
}
return [...points, points[0]]
}


/**
* 通过屏幕两个点坐标构建箭头
*
* @param {number} x1 - 第一个点的横坐标
* @param {number} y1 - 第一个点的纵坐标
* @param {number} x2 - 第二个点的横坐标
* @param {number} y2 - 第二个点的纵坐标
* @param {number} angleC - 角度C
* @param {number} angleE - 角度E
* @param {number} length -  
* @returns {{ 
*       C:{ x: number, y: number },
*       D:{ x: number, y: number },
*       E:{ x: number, y: number },
*        F:{ x: number, y: number },
*  }} 返回所有点组成的对象。
* 
*/
export function calcArrowPoints(x1, y1, x2, y2, angleC, angleE, length) {
  // 将角度转换为弧度
  const angleCInRadians = (Math.PI / 180) * angleC;
  const angleEInRadians = (Math.PI / 180) * angleE;

  // 向量 AB 的方向
  const dx = x2 - x1;
  const dy = y2 - y1;
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / magnitude;
  const unitY = dy / magnitude;
  

  // 垂直向量
  const perpX = -unitY;
  const perpY = unitX;

  // 计算点 C 和 D
  const cx = x2 + length * (Math.cos(angleCInRadians) * unitX + Math.sin(angleCInRadians) * perpX);
  const cy = y2 + length * (Math.cos(angleCInRadians) * unitY + Math.sin(angleCInRadians) * perpY);

  const dxCoord = x2 + length * (Math.cos(-angleCInRadians) * unitX + Math.sin(-angleCInRadians) * perpX);
  const dyCoord = y2 + length * (Math.cos(-angleCInRadians) * unitY + Math.sin(-angleCInRadians) * perpY);

  // 计算点 E 和 F
  const ex = x2 + length * (Math.cos(angleEInRadians) * unitX + Math.sin(angleEInRadians) * perpX);
  const ey = y2 + length * (Math.cos(angleEInRadians) * unitY + Math.sin(angleEInRadians) * perpY);

  const fx = x2 + length * (Math.cos(-angleEInRadians) * unitX + Math.sin(-angleEInRadians) * perpX);
  const fy = y2 + length * (Math.cos(-angleEInRadians) * unitY + Math.sin(-angleEInRadians) * perpY);

  return { C: { x: cx, y: cy }, D: { x: dxCoord, y: dyCoord }, E: { x: ex, y: ey }, F: { x: fx, y: fy } };
}


/**
* 标注框模板
*
* @param {number} width - 宽
* @param {number} height - 高
* @param {string} borderColor - 边框颜色
* @param {number} borderSize - 边框粗细
* @returns {string} 标注框html模板
*/
export function createMarkHtml(width,height,borderColor,borderSize){
return `
    <div style="position: relative;width: ${width}px;height: ${height}px;">
        <svg id="svg" width="${width}" height="${height}" viewbox="${-2-borderSize} ${-2-borderSize} ${width+borderSize+4} ${height}">
            <path 
                d="
                    M ${width * 0.2},0
                    H ${width * 0.8}
                    C ${width},0 ${width},0 ${width},${height * 0.2}
                    V ${height * 0.6}
                    C ${width},${height * 0.8} ${width},${height * 0.8} ${width * 0.8},${height * 0.8}
                    H ${width * 0.4}
                    L ${width * 0.3} ${height}
                    V ${height * 0.8}
                    H ${width * 0.2}
                    C 0,${height * 0.8} 0,${height * 0.8} 0,${height * 0.6}
                    V ${height * 0.2}
                    C 0,0 0,0 ${width * 0.2},0
                    Z
                " 
              stroke="${borderColor}" 
              stroke-width="${borderSize}" 
              fill="none"
            ></path>    
        </svg>
    </div>
`
}


/**
* 马赛克模板
*
* @param {number} width - 宽
* @param {number} height - 高
* @returns {string} 马赛克html模板
*/
export function createMosaicHtml(width,height){
return `
  <div 
    style="
      width:${width}px;
      height:${height}px;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA3NCSVQICAjb4U/gAAAABlBMVEXMzMz////TjRV2AAAACXBIWXMAAArrAAAK6wGCiw1aAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAABFJREFUCJlj+M/AgBVhF/0PAH6/D/HkDxOGAAAAAElFTkSuQmCC');
    "
  ></div>
`
}

/**
*  提取html模板中的text和style
* @param {string} htmlString - html模板
* @returns {{text:string, style:any}} 
* */
export function extractTextAndStyle(htmlString) {
const parser = new DOMParser();
const doc = parser.parseFromString(htmlString, "text/html");
const div = doc.querySelector("div");

if (!div) {
  throw new Error("No <div> element found in the input.");
}

const textContent = div.textContent.trim();
const styleString = div.getAttribute("style") || "";
const styleObject = {};

// Convert style string to object
styleString.split(";").forEach(style => {
  const [key, value] = style.split(":").map(s => s.trim());
  if (key && value) {
    // Convert CSS property to camelCase for JavaScript style object
    const camelCaseKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    styleObject[camelCaseKey] = value;
  }
});

return {
  text: textContent,
  style: styleObject
};
}

// 隐藏默认右键菜单
export function hideContextmenu(){
const observer = new MutationObserver(function (mutationsList) {
  for (let mutation of mutationsList) {
      for (let node of mutation.addedNodes) {
          if (node.style && node.style.opacity == 0.999) {
              node.style.display = 'none'
          }
      }
  }
});
const targetNode = document.getElementById('krpanoSWFObject');
const config = { childList: true, subtree: true }; // 观察子节点的变化  
observer.observe(targetNode, config);
}