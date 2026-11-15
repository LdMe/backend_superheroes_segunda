import { DataTypes } from "sequelize";
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
    // Campo VIRTUAL: no existe en la base de datos, se calcula al leerlo.
    // El nivel de utilidad del héroe es la media del de sus poderes.
    // Solo se puede calcular si hemos cargado los poderes con
    // include: { model: Power, as: "powers" }; si no, vale null.
    utility_level:{
        type: DataTypes.VIRTUAL,
        get() {
            const powers = this.powers;
            if (!powers) {
                return null; // no se han cargado los poderes
            }
            if (powers.length === 0) {
                return 0; // héroe sin poderes
            }
            const total = powers.reduce((sum, power) => sum + power.utility_level, 0);
            const average = total / powers.length;
            return Math.round(average * 10) / 10; // redondeamos a 1 decimal
            // Si preferimos la suma en vez de la media: return total;
        }
    },
},{
    tableName: "heroes",
    timestamps:true, // asegurarse de que tiene created_at, updated_at
    underscored: true,
});

export default Hero;
