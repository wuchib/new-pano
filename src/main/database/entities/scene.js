import { EntitySchema } from "typeorm"
import  Scene  from "../model/scene";


export const SceneEntity = new EntitySchema({
    name: "scene",
    target: Scene,
    tableName:'scene',
    columns: {
        id: {
            type: 'int',
            primary: true,
            generated: true,
        },
        name: {
            type: 'varchar',
        },
        url: {
            type: 'varchar',
        }
    },
})