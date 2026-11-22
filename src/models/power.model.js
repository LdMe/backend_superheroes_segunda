import { DataTypes } from "sequelize";
import connection from "../config/db.js";

const Power = connection.define("Power",{
    powerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description:{
        type:DataTypes.TEXT
    },
    utility_level:{
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 5,
        // con { args, msg } personalizamos el mensaje del ValidationError
        validate:{
            min: { args: [1], msg: "El nivel de utilidad debe estar entre 1 y 10" },
            max: { args: [10], msg: "El nivel de utilidad debe estar entre 1 y 10" }
        }
    },
},{
    tableName: "powers",
    timestamps:true, // asegurarse de que tiene created_at, updated_at
    underscored: true,
});

export default Power;
