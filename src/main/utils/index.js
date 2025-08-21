import fs from 'fs'
import path from 'path'


/**
 * 确保路径下存在某个文件夹，如果不存在就创建它
 * @param {string} basePath - 基础路径
 * @param {string} folderName - 文件夹名
 * @returns {string} - 最终的文件夹完整路径
 */
export function ensureFolderExists(basePath, folderName) {
    const targetPath = path.join(basePath, folderName);
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }
    return targetPath;
}

/**
 * 在指定文件夹中创建文件（如果不存在），并写入内容
 * @param {string} folderPath - 文件夹路径
 * @param {string} fileName - 文件名，例如 'config.json'
 * @param {string|Buffer|object} content - 文件内容（对象会自动转为 JSON）
 */
export function createFile(folderPath, fileName, content = '') {
    const filePath = path.join(folderPath, fileName);

    // 若内容是对象，转为 JSON 字符串
    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }

    fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
    return filePath;
}



export async function deletePaths(paths) {
  const promises = paths.map(async (p) => {
    try {
      await fs.promises.rm(p, { recursive: true, force: true });
      console.log(`✅ 已删除: ${p}`);
    } catch (err) {
      console.error(`❌ 删除失败: ${p}`, err.message);
    }
  });

  await Promise.all(promises);
}



