import { DataSource } from 'typeorm'
// import User from '../model/User'
import { app } from 'electron'
import path from 'path'

const configPath = app.getPath('userData')
const database = path.join(configPath, 'database.sqlite');

export const AppDataSource = new DataSource({
  type: "better-sqlite3", // 设定链接的数据库类型
  database, // 数据库存放地址
  synchronize: true, // 确保每次运行应用程序时实体都将与数据库同步
  logging: ['error','warn'], // 日志，默认在控制台中打印，数组列举错误类型枚举
  entities: [], // 实体或模型表
})