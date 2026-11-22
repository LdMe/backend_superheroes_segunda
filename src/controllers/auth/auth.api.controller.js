import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../../repositories/user.repository.js";
import { UnauthorizedError, ValidationError } from "../../utils/errors.js";

// Igual que auth.view.controller.js, pero:
// - en vez de guardar el usuario en la sesión, devolvemos un token JWT
// - en vez de redirigir, respondemos JSON con el código de estado adecuado

const TOKEN_EXPIRATION = "1h";


// POST /api/auth/register
const register = async (req, res) => {
    const { username, email, password } = req.body;
    const role = "user"; // el registro público siempre crea usuarios normales
    try {
        if (!password) {
            throw new ValidationError("La contraseña es obligatoria");
        }
        // si el email o el username ya existen, el repositorio lanza
        // UniqueEmailError o UniqueUsernameError (409)
        const user = await userRepository.create({ username, email, password, role });
        res.status(201).json({ data: user });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ error: error.message });
    }
}


// POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            throw new ValidationError("Email y contraseña son obligatorios");
        }
        // si no existe, getByEmail lanza NotFoundError (lo tratamos en el catch)
        const user = await userRepository.getByEmail(email);
        const compare = await bcrypt.compare(password, user.password);
        if (!compare) {
            throw new UnauthorizedError("Credenciales incorrectas");
        }
        // en el token guardamos lo mismo que en la sesión de las vistas.
        // ¡Nunca datos sensibles! El contenido de un JWT se puede leer (no está cifrado, solo firmado)
        const payload = { userId: user.userId, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        res.json({
            data: {
                token,
                user: { userId: user.userId, username: user.username, role: user.role }
            }
        });
    } catch (error) {
        console.error(error);
        // no decimos si lo que falla es el email o la contraseña
        if (error.status === 404) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }
        res.status(error.status || 500).json({ error: error.message });
    }
}


export default {
    register,
    login
}
