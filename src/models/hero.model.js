import { DataTypes, Utils } from "sequelize";
import connection from "../config/db.js";

const Hero = connection.define("Hero",{
    heroId: {
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
        validate:{
            min: 1,
            max: 10
        }
    },
},{
    tableName: "heroes",
    timestamps:true, // asegurarse de que tiene created_at, updated_at
    underscored: true,
});

export default Hero;