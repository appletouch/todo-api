/**
 * Created by PKoolwijk on 1-11-2015.
 */

//******ALL REQUIRED MODULES
var bodyparser =require('body-parser');
var express =require('express');
var _ = require("underscore");

//******ALL VARIABLES
var app = express();
var PORT = process.env.PORT||3000;
var todoNextid= 4;

//******DECLARE APPLICATION
app.use(bodyparser.json());

//******SET UP DATA MODEL IN ARRAY WITH DEFAULT TEST DATA
var todos =[
    {
        id:1,
        description:"meet me today(local)",
        completed:true
    },
    {
        id:2,
        description:"Go shopping(local)",
        completed:true
    },
    {
        id:3,
        description:"Go surfing(local)",
        completed:true
    }

];


//**************************
//******ALL METHODS FOR REST
//**************************

//******ROOT RETURNS TEXT
app.get('/',function(req,res){
    res.send('Peter\'s ToDo API root');
});

//******ALL TODOS
//get request gets all the todos

////get request gets all the todos when no parameters are send.
//GET /todos?completed=true
app.get('/todos', function(req, res){
    var queryParams = req.query;
    var filteredTodos = todos;
    //if has property completed && completed = true
    //filtered todos
    if(queryParams.hasOwnProperty('completed')&& queryParams.completed==='true'){
        filteredTodos= _.where(filteredTodos,{completed:true})
    }
    else if(queryParams.hasOwnProperty('completed')&& queryParams.completed==='false'){
        filteredTodos= _.where(filteredTodos,{completed:false})
    }

    if(queryParams.hasOwnProperty("s") && queryParams.s.length>0){
      console.log('Searching in description');
        filteredTodos= _.filter(filteredTodos,function(todo){
            return todo.description.toLowerCase().indexOf(queryParams.s.toLowerCase())> -1
        })
    }
    res.json(filteredTodos)
});

//******SINGLE TODO
//Single todo with endppoint
app.get('/todos/:id', function(req, res){

    var todoid = parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(todos,{id:todoid});


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

});

//******NEW TODO
app.post('/todos',function(req, res){
    // to access body you need to install module "body-parser"

    //prevent extra fields
    var body = _.pick(req.body,'description','completed');
    /*validation to check on added completed todo removed, but schould be in the following if condition if needed.*/
    if (!_.isBoolean(body.completed)|| !_.isString(body.description)||body.description.trim().length==0){
        return res.status(400).send();
    }
    console.log('description:' + ' ' + body.description + " = " + body.completed);
    body.id =todoNextid++;

    todos.push(body);

    res.json(body);


});

//******DELETE TODO
app.delete('/todos/:id', function(req, res){
    var todoid = parseInt(req.params.id,10);
    idToDelete=_.indexOf(todos, _.findWhere(todos, { id : todoid})); //finds position in array to delete
    //idToDelete2= _.findWhere(todos, { id : todoid})  //finds whole object in array to delete.

    if(idToDelete!=-1){
        try{
            todos.splice(idToDelete, 1);
            res.status(200).json({"Succes": "deleted id:" + todoid});
        }
        catch(e) {
            res.status(404).send();
        }
    }
    else {
        res.status(404).json({"error": "No todo found while deleting"});
    }
   });

//******UPDATE TODO
app.put('/todos/:id', function(req, res){
    var todoId =parseInt(req.params.id, 10);
    //var matchedTodo= _.findWhere(todos,{id:todoId})

    //prevent extra fields
    var body = _.pick(req.body,'description','completed');
    var validAttributes={};

    idToUpdate=_.indexOf(todos, _.findWhere(todos, { id : todoId})); //finds position in array to delete
    if (idToUpdate<0) {
        res.status(404).send("Id to update not found")
    }


    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
        validAttributes.completed = body.completed
    }
    else if (body.hasOwnProperty('completed')){
        return res.status(400).send()
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.length>0){
        validAttributes.description=body.description
    }
    else if (body.hasOwnProperty('description')){
        return res.status(400).send()
    }

    console.log(validAttributes);

    objectToUpdate= _.findWhere(todos, { id : todoId});
    _.extend(objectToUpdate,validAttributes);

    //OR

    //console.log('id to update: '+idToUpdate)
    //todos[idToUpdate].description=validAttributes.description
    //todos[idToUpdate].completed=validAttributes.completed


    //respond json send a 200 status back
    res.json(todos[idToUpdate])



});


//******START APPLICATION!!!
app.listen(PORT, function(){
    console.log('Listening on port: ' + PORT)

});



