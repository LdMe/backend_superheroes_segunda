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
    const role = "user"; // el registro público siempre crea usuarios normales
    if (!password) {
        return redirect(res,"/auth/register",{error:"La contraseña es obligatoria"});
    }
    if (password !== passwordRepeat) {
        return redirect(res,"/auth/register",{error:"Las contraseñas no coinciden"});
    }
    try {
        // si el email o el username ya existen, el repositorio lanza
        // UniqueEmailError o UniqueUsernameError con un mensaje claro
        await userRepository.create({username,email,password,role})
        redirect(res,"/auth/login",{message:"Registro exitoso"})

    } catch (error) {
        console.error(error);
        redirect(res,"/auth/register",{error: error.message})
    }
}


const loginForm = async (req, res) => {

    res.render("auth/login")
}

const login = async (req, res) => {
    const {email,password} = req.body;
    try {
        // si no existe, getByEmail lanza NotFoundError (lo tratamos en el catch)
        const user = await userRepository.getByEmail(email);
        const compare = await bcrypt.compare(password,user.password);
        if(!compare){
            return redirect(res,"/auth/login",{error:"Credenciales incorrectas"});
        }
        req.session.user = {userId:user.userId, username:user.username, role:user.role};
        redirect(res,"/",{message:"Login exitoso"});

    } catch (error) {
        console.error(error);
        // no decimos si lo que falla es el email o la contraseña
        if (error.status === 404) {
            return redirect(res,"/auth/login",{error:"Credenciales incorrectas"});
        }
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
