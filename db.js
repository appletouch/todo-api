/**
 * Created by PKoolwijk on 15-12-2015.
 */

var env = process.env.NODE_DEV||'development';

var Sequelize = require('sequelize');
var sequelize;

if (env==='production'){
    sequelize = new Sequelize(process.env.DATABASE_URL,{
        dialect:'postgres'
    });
}
else
{
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.sequelize = sequelize;   //==>new Sequelize instance.......
db.Sequelize = Sequelize;  //==> require('sequelize') libary

//export so it is available to other modueles
module.exports = db;

