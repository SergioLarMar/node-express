//librerias requeridas de mongoose-> Mongoose y Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: { type: String, unique: true, required: [true, 'La descripción es obligatoria'] },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
});

//exportar el modelo Categoria de nombre 1º parametro y la variable que lo contiene
module.exports = mongoose.model('Categoria', categoriaSchema);