
import userRepository from "../../repositories/user.repository.js";


// ------------------ CRUD de user ----------------------------

// ------------------ C (Create)
// endpoint para crear dato
const create = async (req,res)=>{
    const {username,email,password,role} = req.body;
    const user = await userRepository.create({
        username,
        email,
        password,
        role
    })
    res.redirect("/user/"+user.userId);
}

const createForm = (req,res)=>{
    const roles = ["user","admin"]
    res.render("user/create",{roles});
}

// ------------------ R (Read)---------------------------------------------
// endpoint lista de datos
const getAll = async(req, res) => {
    const users = await userRepository.getAll();
    res.render("user/list",{users})
};

// endpoint dato individual
const getById =async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await userRepository.getById(id);
    res.render("user/show",{user})
};


// ---------------- U (Update) -----------------------------------
// endpoint para cambiar dato por completo
const update =async (req,res)=>{
    const id = req.params.id;
    const user  = await userRepository.update(id,req.body);
    if(user){
        res.redirect("/user/"+user.id);
    }else{
        res.redirect("/user");
    }

}

const updateForm = async (req,res)=>{
    const id = parseInt(req.params.id);
    const user  = await userRepository.getById(id);
    res.render("user/update", {user})
}


// ------------------------ D (Delete)------------

const remove =async (req,res)=>{
    const id  = parseInt(req.params.id);
    const user = await userRepository.remove(id);
    res.redirect("/user");
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