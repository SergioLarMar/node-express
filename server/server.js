//pedir el fichero configuración
require('./config/config');
// pedir express, mongoose y path para construir las rutas absolutas
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
//iniciar la app
const app = express();
// pedir bodyParser https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
/**
 * bodyParser.urlencoded(): analiza el texto como datos codificados en URL 
 * (que es la forma en que los navegadores tienden a enviar datos de formulario
 *  de formularios normales establecidos a POST) y expone el objeto resultante 
 * (que contiene las claves y los valores) en req.body. 
 * Para comparacion; en PHP todo esto se hace automáticamente y se expone en $ _POST.
 * https://github.com/expressjs/body-parser#bodyparserurlencodedoptions
 */
app.use(bodyParser.json());
// habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));
// Configuración global de rutas
app.use(require('./routes/index'));


// conexion a mongoDB
mongoose.connect(process.env.URLDB, (err, res) => {

    if (err) throw err;

    console.log('Base de datos ONLINE');

});


//exponer en el puerto la app
app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto: ', process.env.PORT);
});