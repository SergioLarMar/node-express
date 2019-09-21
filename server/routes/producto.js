//importar express
const express = require('express');
// Importar middlewares autenticacion
const { verificaToken } = require('../middlewares/autenticacion');
//iniciar la variable app
let app = express();
//importar el modelo
let Producto = require('../models/producto');


// ===========================
//  Obtener productos
// ===========================
//mostrar todos los resultados
app.get('/productos', verificaToken, (req, res) => {
  // para la paginacion iniciar desde 0 o desde el numero que se desee
    let desde = req.query.desde || 0;
    //convertir a numero, para que no sea string
    desde = Number(desde);
     //modelo, usar el metodo find para traer todos los resultados
    // en los {} se ponen filtros,solo los disponibles sin borrado logico(false)
    Producto.find({ disponible: true })
        // poner los resultados desde esa pagina que se envia por parametro
        .skip(desde)
        //numero de resultados por página
        .limit(5)
        //traer esos campos de usuario
        .populate('usuario', 'nombre email')
        //traer esos campos de categoria
        .populate('categoria', 'descripcion')
        //ejecutar la query
        .exec((err, productos) => {
           //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });


        })

});

// ===========================
//  Obtener un producto por ID
// ===========================
app.get('/productos/:id', (req, res) => {
    // populate: usuario categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id)
        //traer esos campos de usuario
        .populate('usuario', 'nombre email')
        //traer esos campos de categoria
        .populate('categoria', 'nombre')
        //ejecutar
        .exec((err, productoDB) => {
              //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
             //error si no existe el id
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

// ===========================
//  Buscar productos
// ===========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    //requerir termino busqueda
    let termino = req.params.termino;
     //convertirlo a expreion regular para filtar mas rapido segun se tipea
    let regex = new RegExp(termino, 'i');
    // realizar la busqueda parametrizada con al regex
    Producto.find({ nombre: regex })
         //traer esos campos de categoria
        .populate('categoria', 'nombre')
        .exec((err, productos) => {

              //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })

        })


});



// ===========================
//  Crear un nuevo producto
// ===========================
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado 

    let body = req.body;

    let producto = new Producto({
        //requerir id usuario del token
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {
          //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// ===========================
//  Actualizar un producto
// ===========================
app.put('/productos/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado 

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
       //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
           //error si no existe el id
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        //recogemos los valores a actualizar
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
             //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });


});

// ===========================
//  Borrar un producto
// ===========================
app.delete('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        //error si no se ejecuta
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
       //error si no existe el id
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }
        //cambiamos productos disponible a false y borrado lógico
        productoDB.disponible = false;
        //Actualizamos el producto para pasar a false y borrarlo lágicamente
        productoDB.save((err, productoBorrado) => {
              //error si no se ejecuta
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //devolvemos producto y el ok que ha sido borrado logicamente
            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });

        })

    })


});






module.exports = app;