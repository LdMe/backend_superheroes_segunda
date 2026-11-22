/**
 * @module models/User
 * @description Definición del modelo User para interactuar con la tabla de usuarios en la base de datos usando Sequelize.
 */
import { DataTypes } from "sequelize";
import connection from "../config/db.js";
import bcrypt from "bcrypt";

/**
 * Modelo de Usuario.
 * 
 * @type {Object}
 * 
 * @property {number} userId - Identificador único del usuario (Clave Primaria).
 * @property {string} username - Nombre de usuario. Debe ser único y no nulo.
 * @property {string} email - Correo electrónico del usuario. Debe ser único y no nulo.
 * @property {string} password - Contraseña del usuario. Se almacena encriptada (Hash).
 * @property {string} role - Rol del usuario. Puede ser "admin" o "user" (por defecto "user").
 */
const User = connection.define("User",{
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type:DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull:false
    },
    role: {
        type: DataTypes.ENUM("admin","user"),
        defaultValue: "user",
        allowNull: false
    }
},{
    tableName: "users",
    timestamps:true, // asegurarse de que tiene created_at, updated_at
    underscored: true,
});

/**
 * Hook de Sequelize que se ejecuta antes de crear un nuevo usuario en la base de datos.
 * Se encarga de encriptar la contraseña en texto plano utilizando bcrypt.
 * 
 * @param {Object} user - Instancia del usuario que está a punto de ser creada.
 */
User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password,10);
  user.password = hashedPassword;
});

/**
 * Hook de Sequelize que se ejecuta antes de actualizar un usuario existente.
 * Comprueba si el campo 'password' ha sido modificado, y de ser así, lo vuelve a encriptar.
 * 
 * @param {Object} user - Instancia del usuario que está a punto de ser actualizada.
 */
User.beforeUpdate(async (user) => {
    if(user.changed("password")){
        const hashedPassword = await bcrypt.hash(user.password,10);
        user.password = hashedPassword;
    }
});

export default User;