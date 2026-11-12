
import heroRepository from "../../repositories/hero.repository.js";


// ------------------ CRUD de hero ----------------------------

// ------------------ C (Create)
// endpoint para crear dato
const create = async (req,res)=>{

    const hero = await heroRepository.create({...req.body,userId:1})
    res.redirect("/hero/"+hero.heroId);
}

const createForm = (req,res)=>{
    res.render("hero/create");
}

// ------------------ R (Read)---------------------------------------------
// endpoint lista de datos
const getAll = async(req, res) => {
    const heroes = await heroRepository.getAll();
    res.render("hero/list",{heroes})
};

// endpoint dato individual
const getById =async (req, res) => {
    const id = parseInt(req.params.id);
    const hero = await heroRepository.getById(id);
    res.render("hero/show",{hero})
};


// ---------------- U (Update) -----------------------------------
// endpoint para cambiar dato por completo
const update =async (req,res)=>{
    const id = req.params.id;
    const hero  = await heroRepository.update(id,req.body);
    if(hero){
        res.redirect("/hero/"+hero.id);
    }else{
        res.redirect("/hero");
    }

}

const updateForm = async (req,res)=>{
    const id = parseInt(req.params.id);
    const hero  = await heroRepository.getById(id);
    res.render("hero/update", {hero})
}


// ------------------------ D (Delete)------------

const remove =async (req,res)=>{
    const id  = parseInt(req.params.id);
    const hero = await heroRepository.remove(id);
    res.redirect("/hero");
}


export default {
    create,
    getAll,
    getById,
    update,
    createForm,
    updateForm,
    remove
}