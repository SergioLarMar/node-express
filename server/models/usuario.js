//librerias requeridas de mongoose-> Mongoose y Schema
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//array con los roles admitodos y mensaje del error en caso ser no valido
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
};


let Schema = mongoose.Schema;

//Esquema de la BBDD mongo
let usuarioSchema = new Schema({
    nombre: {
        //tipo de datos 
        type: String,
        //Campo requerido y el error en caso de ser nulo
        required: [true, 'El nombre es necesario']
    },
    email: {
         //tipo de datos
        type: String,
        //validacion para que sea unico
        unique: true,
        //Campo requerido y el error en caso de ser nulo
        required: [true, 'El correo es necesario']
    },
    password: {
         //tipo de datos
        type: String,
        // requerido y el error que saca
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
         //tipo de datos
        type: String,
        // no requerido
        required: false
    },
    role: {
         //tipo de datos
        type: String,
        //rol por defecto
        default: 'USER_ROLE',
        //array de roles validos declarado arriba
        enum: rolesValidos
    },
    estado: {
         //tipo de datos
        type: Boolean,
         // requerido
        default: true
    },
    google: {
         //tipo de datos
        type: Boolean,
         //no requerido
        default: false
    }
});

// convertir el usuario en un json
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}


usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

//exportar el modelo Usuario de nombre 1º parametro y la variable que lo contiene
module.exports = mongoose.model('Usuario', usuarioSchema);