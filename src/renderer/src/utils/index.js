export function transTime(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`
}



/**
 * 根据文件名获取路径
 * @param {string} fileName - 文件名，例如 'logo.png'
 * @returns {string | null} - 打包后的路径，如果找不到返回 null
 */
export function getAssetPath(fileName) {
    // import.meta.glob 会在编译时扫描匹配的文件
    const assetModules = import.meta.glob('/src/assets/img/hs/*', { eager: true, import: 'default' });
    for (const path in assetModules) {
        if (path.endsWith(fileName)) {
            return assetModules[path];
        }
    }
    return null;
}

/**
 * 获取路径的叶子节点
 * @param {string} path - 路径字符串，可以是 / 或 \ 分隔
 * @returns {string} - 叶子节点
 */
export function getLeafNode(path) {
  if (!path) return '';
  // 统一使用 / 分隔
  const normalizedPath = path.replace(/\\/g, '/');
  const parts = normalizedPath.split('/');
  return parts[parts.length - 1];
}