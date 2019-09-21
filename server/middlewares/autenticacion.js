//requerir el modulo jsonwebtoken
const jwt = require('jsonwebtoken');


// =====================
// Verificar Token
// =====================

//callbacak en variable con estructura middleware (req, res, next)
let verificaToken = (req, res, next) => {
    //recoger el token de las cabeceras
    let token = req.get('token');
    //metodo de verificar el token de la libreria jsonwebtoken
    //jwt.verify(token, semilla del token, (err, decoded)
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //si se produce el error respuesta json
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });



};

// =====================
// Verifica AdminRole
// =====================
let verificaAdmin_Role = (req, res, next) => {
    //requerir todo el objeto usuario
    let usuario = req.usuario;
    //comprobar que el usuario enviado tiene el rol pedido
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

//exportar los dos modulos
module.exports = {
    verificaToken,
    verificaAdmin_Role
}