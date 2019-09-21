//importar express
const express = require('express');
// Importar middlewares autenticacion
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
//iniciar la variable app
let app = express();
//importar el modelo
let Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================
//mostrar todos los resultados
app.get('/categoria', verificaToken, (req, res) => {
    //modelo, usar el metodo find para traer todos los resultados
    // en los {} se ponen filtros, en este caso no
    Categoria.find({})
         // metodo ordenar
        .sort('descripcion')
        //metodo traer las propiedades pasadas en parametros
        .populate('usuario', 'nombre email')
        //ejecutar la consulta
        .exec((err, categorias) => {
           //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
          // respuesta con exito, devuelve las categorias
            res.json({
                ok: true,
                categorias
            });

        })
});

// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById(....);
     // coger el parametro de la url
    let id = req.params.id;
    // buscar por id
    Categoria.findById(id, (err, categoriaDB) => {
         //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
         //error si no existe la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }


        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// ============================
// Crear nueva categoria
// ============================
// ruta post con middleware verificar token
app.post('/categoria', verificaToken, (req, res) => {
    //requerir el body que se envia en la peticion
    let body = req.body;
    //crear la nueva categoria el objeto
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

   //grabar en la BBDD
    categoria.save((err, categoriaDB) => {
         //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
         //error si no existe la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });


    });


});

// ============================
// Actualizar  categorias
// ============================
//pedir token para actualizar y dar permiso
app.put('/categoria/:id', verificaToken, (req, res) => {
    //requerir los parametros en la url y requerir el body enviado en cabeceras
    let id = req.params.id;
    let body = req.body;
    //crear la categoria
    let descCategoria = {
        descripcion: body.descripcion
    };
     //actualizar con el metodo findByIdAndUpdate
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
      //error si no existe la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// ============================
// Borrar categorias
// ============================
//solicitar verificaToken, verificaAdmin_Role para ver si tiene permisos
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorias
   // meter en una variable local el parametro de la url de la id
    let id = req.params.id;
     // Categoria.findByIdAndRemove
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
          //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //error si no existe la categoria
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });

    });


});

//se exporta todo el app
module.exports = app;