/**
 * Created by PKoolwijk on 1-11-2015.
 */


var bodyparser =require('body-parser');
var express =require('express');
var _ = require("underscore");

var app = express();
var PORT = process.env.PORT||3000;

var todoNextid= 4;

app.use(bodyparser.json());

var todos =[{
        id:1,
        description:"meet me today(local)",
        completed:false
},
    {
        id:2,
        description:"Go shopping(local)",
        completed:false
    },
    {
        id:3,
        description:"Go surfing(local)",
        completed:false
    }

];

app.get('/',function(req,res){
    res.send('Peter\'s ToDo API root');
});

//get request gets all the todos
app.get('/todos', function(req, res){
    res.json(todos)
})


//Single todo with endppoint
app.get('/todos/:id', function(req, res){

    var todoid = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{id:todoid})


    //todos.forEach(function(todo){
    //    if (todoid===todo.id){
    //        matchedTodo=todo;
    //    }
    //});

    if (matchedTodo){
        res.json(matchedTodo)
    }else {
        res.status(404).send();
    }

})

app.post('/todos',function(req, res){
    // to access body you need to install module "body-parser"

    //prevent extra fields
    var body = _.pick(req.body,'description','completed');

    if (!_.isBoolean(body.completed)|| !_.isString(body.description)||body.description.trim().length==0||body.completed){
        return res.status(400).send();
    }
    console.log('description:' + ' ' + body.description + " = " + body.completed);
    body.id =todoNextid++;

    todos.push(body);

    res.json(body);


})



var server =app.listen(PORT, function(){
    console.log('Listening on port: ' + PORT)

})




