import { EntitySchema } from "typeorm"

export const CategoryEntity = new EntitySchema({
    name: "scene",
    columns: {
        id: {
            type: String,
            primary: true,
            generated: true,
        },
        name: {
            type: String,
        },
        url:{
            type: String,
        }
    },
})