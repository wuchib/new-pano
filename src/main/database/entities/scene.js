import { EntitySchema } from "typeorm"
// const Category = require("../model/Category").Category; // 
import  Scene  from "../model/scene";


export const SceneEntity = new EntitySchema({
    name: "scene",
    target: Scene,
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