//importar express
const express = require('express');
//importar bcrypt y jsonwebtoken
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//importar  en una deconstruccion OAuth2Client
const { OAuth2Client } = require('google-auth-library');
// poner el token de google en una constante
const client = new OAuth2Client(process.env.CLIENT_ID);
//requerir el modelo usuario
const Usuario = require('../models/usuario');
//iniciar express en una constante
const app = express();


//ruta del login
app.post('/login', (req, res) => {
    //traer los parametros del body que envia el usuario correo y password
    let body = req.body;
   //comprobar el mail del body coincide con el de la BBDD con el metodo findOne
   // se trae el esquema en Usuario.findOne, eso busca y compara
   // Condición-> la propiedad-> email: tiene que ser igual a ->body.email comprueba si existe en BBDD
   // como resultado callback-> error o traer el usuarioDB en esa variable
     Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
         //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
      //error si no encuentra el usuario
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        // comparar la password encriptada con el metodo de bcrypt-> compareSync
        // el metodo encripta y compara, asi comparamos la enviada con la de BBDD
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }
         //callback con el metodo jwt.sign para generar el JWT token
         // 3 parametros, usuario que viene en usarioDB, el seed del token y el expires
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        // devolvemos el usuario y el token generado
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });


    });

});


// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {

            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });

            }

        } else {
            // Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });


            });

        }


    });


});





module.exports = app;