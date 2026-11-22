class ErrorWithStatus extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

class GenericError extends ErrorWithStatus {
    constructor(message="Ha ocurrido un error de servidor"){
        super(message,500);
        this.name = "GenericError"
    }
}

// --------------------------- errores de unicidad
class UniqueConstraintError extends ErrorWithStatus {
    constructor(message = "Ya existe un registro con estos valores"){
        super(message);
        this.status = 409;
        this.name="UniqueConstraintError";
    }
}

class UniqueEmailError extends UniqueConstraintError {
    constructor(email) {
        super(`Ya existe un usuario con el email ${email}`);
        this.name = "UniqueEmailError";
    }
}
class UniqueUsernameError extends UniqueConstraintError {
    constructor(username) {
        super(`Ya existe un usuario con el username ${username}`);
        this.name = "UniqueUsernameError";
    }
}
// héroes y poderes tienen el nombre único
class UniqueNameError extends UniqueConstraintError {
    constructor(name) {
        super(`Ya existe un registro con el nombre ${name}`);
        this.name = "UniqueNameError";
    }
}

// --------------- errores de validación
class ValidationError extends ErrorWithStatus {
    constructor(message="Error de validación de datos"){
        super(message,400);
        this.name="ValidationError";
    }
}

// ---------------- errores de no encontrado

class NotFoundError extends ErrorWithStatus {
    constructor(message="Recurso no encontrado"){
        super(message,404);
        this.name="NotFoundError";
    }
}

// ---------------- errores de autenticación y autorización

// 401: no sabemos quién eres (no hay sesión/token, o es inválido)
class UnauthorizedError extends ErrorWithStatus {
    constructor(message="Tienes que iniciar sesión"){
        super(message,401);
        this.name="UnauthorizedError";
    }
}

// 403: sabemos quién eres, pero no tienes permiso para hacer esto
class ForbiddenError extends ErrorWithStatus {
    constructor(message="No tienes permiso para hacer esto"){
        super(message,403);
        this.name="ForbiddenError";
    }
}

const errorFamilies = {
    SequelizeUniqueConstraintError: { // valores que no se pueden repetir
        default: UniqueConstraintError,
        username: UniqueUsernameError,
        email: UniqueEmailError,
        name: UniqueNameError
    },
    SequelizeValidationError:{ // validación incorrecta
        default: ValidationError
    },
    SequelizeForeignKeyConstraintError: { // clave foranea que no apunta correctamente
        default: GenericError
    },
    SequelizeDatabaseError:{ // error de base de datos
        default: GenericError
    },


}
/**
 * Convierte cualquier error en uno de nuestros errores con status y lo lanza.
 * - Si ya es uno de los nuestros (NotFoundError, ForbiddenError...), lo relanza tal cual.
 * - Si es un error de Sequelize, busca la clase adecuada en errorFamilies.
 * - Si no sabemos qué es, lanza un GenericError (500).
 *
 * @param {Error} error - Error capturado en el repositorio.
 * @throws {ErrorWithStatus}
 */
const throwError = (error) =>{
    if(error instanceof ErrorWithStatus){
        throw error;
    }
    if(error.name in errorFamilies){
        const family =  errorFamilies[error.name];
        const path = error.errors && error.errors[0].path;
        const value = error.errors && error.errors[0].value;
        if(path in family){
            // error específico de un campo: el constructor recibe el valor repetido
            const ErrorType = family[path];
            throw new ErrorType(value);
        }else{
            // error genérico de la familia: usamos el mensaje de la validación (si lo hay)
            const ErrorType = family["default"];
            const message = error.errors && error.errors[0].message;
            throw new ErrorType(message || undefined);
        }
    }else{
        throw new GenericError();
    }
}

export {
    ErrorWithStatus,
    GenericError,
    UniqueConstraintError,
    UniqueEmailError,
    UniqueUsernameError,
    UniqueNameError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    throwError
}
