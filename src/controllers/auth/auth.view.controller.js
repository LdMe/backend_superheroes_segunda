import bcrypt from "bcrypt";
import userRepository from "../../repositories/user.repository.js";


function redirect(res,url,data = {}){
    const urlSearchParams = new URLSearchParams();
    for(const key in data){
        urlSearchParams.append(key,data[key]);
    }
    res.redirect(url+"?"+urlSearchParams.toString())
}
const registerForm = async (req, res) => {

    res.render("auth/register")
}
const register = async (req, res) => {
    const { username, email, password, passwordRepeat } = req.body;
    const role = "user";
    if (password !== passwordRepeat) {
        redirect(res,"/auth/register",{error:"Las contraseñas no coinciden"})
        return;
    }
    try {
        let oldUser = await userRepository.getByEmail(email);
        if (oldUser) {
            redirect(res,"/auth/register",{error:"Ya existe un usuario con este email"})
            return;
        }
        oldUser = await userRepository.getByUsername(username);
        if (oldUser) {
            redirect(res,"/auth/register",{error:"Ya existe un usuario con este nombre"})
            return;
        }
        const user = await userRepository.create({username,email,password,role})
        redirect(res,"/auth/login",{message:"Registro exitoso"})
        
    } catch (error) {
        console.error(error);
        redirect(res,"/auth/register",{error:"Error al registrarse"})
    }
}


const loginForm = async (req, res) => {

    res.render("auth/login")
}

const login = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await userRepository.getByEmail(email);
        if(!user){
            return redirect(res,"/auth/login",{error:"Credenciales incorrectas"});
        } 
        console.log(user, password)
        const compare = await bcrypt.compare(password,user.password);
        console.log(compare);
        if(!compare){
            return redirect(res,"/auth/login",{error:"Credenciales incorrectas"});
        }
        req.session.user = {userId:user.userId, role:user.role};
        redirect(res,"/",{message:"Login exitoso"});

    } catch (error) {
        console.error(error);
        redirect(res,"/auth/login",{error:"Ha habido un error en el Login"});
    }
}


const logout = async (req, res) => {
    req.session.destroy();
    res.redirect("/");
}


export default {
    registerForm,
    register,
    loginForm,
    login,
    logout
}