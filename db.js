/**
 * Created by PKoolwijk on 15-12-2015.
 * Hope this fixes my problem
 */

var env = process.env.NODE_ENV||'development';

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

/* You can also store your model definitions in a single file using the  import
   method. The returned object is exactly the same as defined in the imported
   file's function. Since  v1:5.0  of Sequelize the import is cached, so you
   won't run into troubles when calling the import of a file twice or more often */

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');

db.sequelize = sequelize;   //==>new Sequelize instance.......
db.Sequelize = Sequelize;  //==> require('sequelize') libary

//here we make the joins between todo' and users
db.todo.belongsTo(db.user); //one to one
db.user.hasMany(db.todo); //one to many



//export so it is available to other modueles
module.exports = db;

