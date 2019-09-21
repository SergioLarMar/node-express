//importar express
const express = require('express');
//iniciar express
const app = express();
//poner todas las rutas de la aplicacion
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));
//exportar app
module.exports = app;