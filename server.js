/**
 * Created by PKoolwijk on 1-11-2015.
 */

//******ALL REQUIRED MODULES
var bodyparser = require('body-parser');
var express = require('express');
var _ = require("underscore");
var db = require('./db.js');

//******ALL VARIABLES
var app = express();
var PORT = process.env.PORT || 3000;
//var todoNextid = 4;

//******DECLARE APPLICATION
app.use(bodyparser.json());

//******SET UP DATA MODEL IN ARRAY WITH DEFAULT TEST DATA
var todos = [
    {
        id: 1,
        description: "meet me today(local)",
        completed: true
    },
    {
        id: 2,
        description: "Go shopping(local)",
        completed: true
    },
    {
        id: 3,
        description: "Go surfing(local)",
        completed: true
    }

];


//**************************
//******ALL METHODS FOR REST
//**************************

//******ROOT RETURNS TEXT
app.get('/', function (req, res) {
    res.send('Peter\'s ToDo API root');
});

//******ALL TODOS
//get request gets all the todos

////get request gets all the todos when no parameters are send.
//GET /todos?completed=true
app.get('/todos', function (req, res) {
    var queryParams = req.query;
    var whereStatment ={};  //empty object to fille with where propeties

    if (queryParams.hasOwnProperty('completed')) {
        if (queryParams.completed === 'true') {
            whereStatment.completed =  true
        }
        else {
            whereStatment.completed = false
        }
    }

    if (queryParams.hasOwnProperty("s") && queryParams.s.length > 0) {
        console.log('Searching in description');
        whereStatment.description={$like: '%'+ queryParams.s.toString() +'%'}

    }


    db.todo.findAll({
        where:whereStatment
    }).then(
        function (todos) {
            if (todos.length > 0) {

                todos.forEach(function (todo) {
                    console.log(todo.toJSON());
                });
                res.json(todos);
            }
            else {
                console.log('*** No Todo found in selection with specified the "where" clause ***');
                res.status(404).send('No Todo found in selection with specified the "where" clause')
            }},
        function (e) {
            res.status(500).json(e.description.toJSON()); //if fails return return error

        }
    );

    //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION
    //var queryParams = req.query;
    //var filteredTodos = todos;
    ////if has property completed && completed = true
    ////filtered todos
    //if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    //    filteredTodos = _.where(filteredTodos, {completed: true})
    //}
    //else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //    filteredTodos = _.where(filteredTodos, {completed: false})
    //}
    //
    //if (queryParams.hasOwnProperty("s") && queryParams.s.length > 0) {
    //    console.log('Searching in description');
    //    filteredTodos = _.filter(filteredTodos, function (todo) {
    //        return todo.description.toLowerCase().indexOf(queryParams.s.toLowerCase()) > -1
    //    })
    //}
    //res.json(filteredTodos)
    //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION

});

//******SINGLE TODO
//Single Todo with endppoint
app.get('/todos/:id', function (req, res) {

    var todoid = parseInt(req.params.id, 10);
    db.todo.findById(todoid).then(
        function(todo){
            if(!!todo) {
                res.json(todo.toJSON());
            }
            else{
                res.status(404).send('Record not found')
            }
        },
        function(e){
            res.status(500).send(e.toString()); // only in case of server erro
        });



    //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION
    //var matchedTodo = _.findWhere(todos, {id: todoid});

    //todos.forEach(function(Todo){
    //    if (todoid===Todo.id){
    //        matchedTodo=Todo;
    //    }
    //});

    //if (matchedTodo) {
    //    res.json(matchedTodo)
    //} else {
    //    res.status(404).send();
    //}
    //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION
});

//******NEW TODO
app.post('/todos', function (req, res) {
    // to access body you need to install module "body-parser"

    //prevent extra fields
    var body = _.pick(req.body, 'description', 'completed');
    /*validation to check on added completed Todo removed, but schould be in the following if condition if needed.*/



        // /call create on db.todo that returns a promise
        db.todo.create(body).then(
            function (todo) {
                res.json(todo.toJSON()); //if succesfull response with 200 and res.json(body);
            },
            function (e) {
                res.status(500).json(e.description.toJSON()); //if fails return error

            });

        //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION
        //if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length == 0) {
        //    return res.status(400).send();
        //}
        //console.log('description:' + ' ' + body.description + " = " + body.completed);
        //body.id = todoNextid++;
        //
        //todos.push(body);

        //res.json(body);
        //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION


});

//******DELETE TODO
app.delete('/todos/:id', function (req, res) {
    var todoid = parseInt(req.params.id, 10);
    db.todo.destroy({
        where:{id:todoid}
    }).then(
        function(numberDeleted) {
            if (numberDeleted === 0) {
                res.status(404).json({error: 'no to do is found'})
            }
            else {
                res.status(204).json(numberDeleted + ' records deleted')
            }
        },
        function(){

            res.status(500).send();
        }
    )});

    //idToDelete = _.indexOf(todos, _.findWhere(todos, {id: todoid})); //finds position in array to delete
    ////idToDelete2= _.findWhere(todos, { id : todoid})  //finds whole object in array to delete.
    //
    //if (idToDelete != -1) {
    //    try {
    //        todos.splice(idToDelete, 1);
    //        res.status(200).json({"Succes": "deleted id:" + todoid});
    //    }
    //    catch (e) {
    //        res.status(404).send();
    //    }
    //}
    //else {
    //    res.status(404).json({"error": "No Todo found while deleting"});
    //}


//******UPDATE TODO
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    //prevent extra fields
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed
    }
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description
    }

    //we don't use the Model method but we use the instance method

    db.todo.findById(todoId).then(             //lookup for id to update.

        function(todo){                        //first call(OK) back for findbyid
            if(todo){
                return todo.update(attributes);    //OK and found
            }
            else{
                res.status(404).send();            //OK but not found
            }
        },
        function(){                           //second call(NOK) back for findByID
            res.status(500).send();
        }
    ).then(function(todo){                //follow up when findbyId went well and found
        res.json(todo.toJSON());
    },function(e){
        res.status(400).json(e);
    });



    //var todoId = parseInt(req.params.id, 10);
    ////var matchedTodo= _.findWhere(todos,{id:todoId})
    //
    ////prevent extra fields
    //var body = _.pick(req.body, 'description', 'completed');
    //var validAttributes = {};
    //
    //idToUpdate = _.indexOf(todos, _.findWhere(todos, {id: todoId})); //finds position in array to delete
    //if (idToUpdate < 0) {
    //    res.status(404).send("Id to update not found")
    //}
    //
    //
    //if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    //    validAttributes.completed = body.completed
    //}
    //else if (body.hasOwnProperty('completed')) {
    //    return res.status(400).send()
    //}
    //
    //if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.length > 0) {
    //    validAttributes.description = body.description
    //}
    //else if (body.hasOwnProperty('description')) {
    //    return res.status(400).send()
    //}
    //
    //console.log(validAttributes);
    //
    //objectToUpdate = _.findWhere(todos, {id: todoId});
    //_.extend(objectToUpdate, validAttributes);
    //
    ////OR
    //
    ////console.log('id to update: '+idToUpdate)
    ////todos[idToUpdate].description=validAttributes.description
    ////todos[idToUpdate].completed=validAttributes.completed
    //
    //
    ////respond json send a 200 status back
    //res.json(todos[idToUpdate])


});



//Call syc and add promise callback function.
db.sequelize.sync(
//if set to true database will be recreated everytime.
    {force: false}
).then(function () {
    //******START APPLICATION!!!
    app.listen(PORT, function () {
        console.log('Listening on port: ' + PORT)

    });
});






