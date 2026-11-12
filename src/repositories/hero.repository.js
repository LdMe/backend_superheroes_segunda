
import { Hero,User } from "../models/index.js";


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
// endpoint para crear dato
const create = async (data)=>{
    const hero = await Hero.create(data)
    return hero;
}


// ------------------ R (Read)---------------------------------------------
// endpoint lista de datos
const getAll = async() => {
    const heroes = await Hero.findAll();
    return heroes;
};

// endpoint dato individual
const getById = async (id) => {
    const hero = await Hero.findByPk(id,{
        include:{
            model: User,
            as: "owner",
            attributes: ["username","email"]
        }
    });
    return hero;
};


// ---------------- U (Update) -----------------------------------
// endpoint para cambiar dato por completo
const update =async (id, data)=>{
    const {name,description,utility_level} = data;
    const hero  = await Hero.findByPk(id);
    if(hero){
        hero.name = name;
        hero.description = description;
        hero.utility_level = utility_level;
        await hero.save();
        return hero;
    }else{
        return null;
    }

}

const modify = async (id,data)=>{
    const {name,description,utility_level} = data;
    const hero  = await Hero.findByPk(id);
    if(!hero){
        return null;
    }
    hero.name = name || hero.name;
    hero.description = description || hero.description;
    hero.utility_level = utility_level || hero.utility_level;
    await hero.save();
    return hero;
}




// ------------------------ D (Delete)------------

const remove =async (id)=>{
    const hero = await Hero.findByPk(id);
    if(hero){
        await hero.destroy();
        return hero;
    }
    return null;
}


export default {
    create,
    getAll,
    getById,
    update,
    modify,
    remove
}