/**
 * Created by PKoolwijk on 15-12-2015.
 */

var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite'
});

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;   //==>new Sequelize instance.......
db.Sequelize = Sequelize;  //==> require('sequelize') libary
/////missing code... see training

//export so it is available to other modueles
module.exports = db;

