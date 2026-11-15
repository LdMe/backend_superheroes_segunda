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
        validate:{
            min: 1,
            max: 10
        }
    },
},{
    tableName: "powers",
    timestamps:true, // asegurarse de que tiene created_at, updated_at
    underscored: true,
});

export default Power;
