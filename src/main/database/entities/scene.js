import { EntitySchema } from "typeorm"
import Scene from "../model/scene";


export const SceneEntity = new EntitySchema({
    name: "scene",
    target: Scene,
    tableName: 'scene',
    columns: {
        id: {
            type: 'varchar',
            primary: true,
        },
        name: {
            type: 'varchar',
        },
        url: {
            type: 'varchar',
        },
        createdAt: {
            type: "datetime",
            createDate: true,   // 插入时自动生成
            default: () => "datetime('now','localtime')"
        },
        updatedAt: {
            type: "datetime",
            updateDate: true,   // 更新时自动更新
            default: () => "datetime('now','localtime')"
        },
    },
})