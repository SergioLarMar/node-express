//importar express
const express = require('express');
//importar bcrypt
const bcrypt = require('bcrypt');
//importar  underscore https://underscorejs.org/ 
const _ = require('underscore');
// requerir el modelo usuario
const Usuario = require('../models/usuario');
//requerir middlewares { verificaToken, verificaAdmin_Role }
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
//iniciar express
const app = express();

// ===========================
//  Obtener Usuario
// ===========================
// con el middleware para verificar JWT
app.get('/usuario', verificaToken, (req, res) => {

    // para la paginacion iniciar desde 0 o desde el numero que se desee
    let desde = req.query.desde || 0;
    //convertir a numero, para que no sea string
    desde = Number(desde);
     // limite de usuarios
    let limite = req.query.limite || 5;
    //convertir a numero, para que no sea string
    limite = Number(limite);
    // buscar el usuario con la condicion true en la condicional de busqueda Usuario.find({ estado: true }
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        // para iniciar desde un numero resultado
        .skip(desde)
        //limite de usuarios por pagina
        .limit(limite)
        //ejecutar la consulta
        .exec((err, usuarios) => {
             //error si no se ejecuta
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
             // contar usuarios
            Usuario.count({ estado: true }, (err, conteo) => {
                 //devolver el ok, los usuarios y la cuenta usuarios activos
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });


        });


});


// ===========================
//  Crear Usuario
// ===========================

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    //recoger parametros de las cabeceras el body
    let body = req.body;
     //crear el objeto a insertar
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //insertar en BBDD
    Usuario.save((err, usuarioDB) => {
          //error si no se ejecuta
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
         //devolver usuario y el ok
        res.json({
            ok: true,
            usuario: usuarioDB
        });


    });


});


// ===========================
//  Actualizar Usuario
// ===========================

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
     //recoger los parametros del id
    let id = req.params.id;
    //underscore funcion https://underscorejs.org/#pick
    // Return a copy of the object, filtered to only have values for the whitelisted keys (or array of valid keys)
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    //usar el metodo findByIdAndUpdate  actualizar id y body para responder solo con los valores permitidos
    // y no insertar nada extraño
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
         //error si no se ejecuta
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        //devolver si el ok y usuario
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    })

});


// ===========================
//  Borrar usuario
// ===========================

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    // requerir el id
    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //cambiar el estado para desactivarlo como usuario activo
    let cambiaEstado = {
        estado: false
    };
    // parametro busqueda el ID y valor a actualizar cambiaEstado en findByIdAndUpdate
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
       //error si no se ejecuta
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };
         //error si existe el id solicitado
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
       //devolver el usuario borrado y el ok
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });



});


//exportar app
module.exports = app;