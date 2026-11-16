import { DataTypes } from "sequelize";
import connection from "../config/db.js";
import bcrypt from "bcrypt";

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


User.beforeCreate(async (user) => {
  const hashedPassword = await bcrypt.hash(user.password,10);
  console.log("hash",hashedPassword,user.password);
  user.password = hashedPassword;
});

User.beforeUpdate(async (user) => {
    if(user.changed("password")){
        const hashedPassword = await bcrypt.hash(user.password,10);
        user.password = hashedPassword;
    }
});

export default User;