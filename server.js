/**
 * Created by PKoolwijk on 1-11-2015.
 */

//******ALL REQUIRED MODULES
var bodyparser = require('body-parser');
var express = require('express');
var _ = require("underscore");
var db = require('./db.js');
var middleware = require('./middleware.js')(db); //passing in db on same line.


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

/*########## TODO SECTION ################## TODO SECTION ################## TODO SECTION ################## TODO SECTION ################## TODO SECTION ########*/

// insert this before your routes to lowercase all query string parameters
app.use(function(req, res, next) {
    for (var key in req.query)
    {
        req.query[key.toLowerCase()] = req.query[key];
    }
    next();
});


//******ROOT RETURNS TEXT
app.get('/',middleware.requireAuthentication,function (req, res) {
                res.send('Peter\'s ToDo API root');
});

//******ALL TODOS
//get request gets all the todos

////get request gets all the todos when no parameters are send.
//GET /todos?completed=true
app.get('/todos', middleware.requireAuthentication ,function (req, res) {
    var queryParams = req.query;
    var whereStatment ={};  //empty object to be  filled with where propeties

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

    //Only get the todos of the user that is logged in.
    whereStatment.userId=req.user.get('id');
    //console.log(whereStatment.userId);


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
                res.status(404).send('No Todo found in selection with specified "where" clause')
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
app.get('/todos/:id', middleware.requireAuthentication ,function (req, res) {

    var todoId = parseInt(req.params.id, 10);
    db.todo.findOne({
        where:{
            id:todoId,
            userId:req.user.get('id')
        }
    }).then(
        function(todo){
            if(!!todo) {
                res.json(todo.toJSON());
            }
            else{
                res.status(404).send('Record not found or you are not authorized')
            }
        },
        function(e){
            res.status(500).send(e.toString()); // only in case of server erro
        });



    //***************THIS CODE IS ONLY USED IN THE ARRAY VERSION
    //var matchedTodo = _.findWhere(todos, {id: todoId});

    //todos.forEach(function(Todo){
    //    if (todoId===Todo.id){
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
app.post('/todos',middleware.requireAuthentication , function (req, res) {
    // to access body you need to install module "body-parser"

    //prevent extra fields
    var body = _.pick(req.body, 'description', 'completed');
    /*validation to check on added completed Todo removed, but schould be in the following if condition if needed.*/



        // /call create on db.todo that returns a promise
    db.todo.create(body).then(
        function (todo) {

            req.user.addTodo(todo)
                .then(
                    function () {
                        /* If you need to get your instance in sync, you can use the method reload .
                        It will fetch the current data from the database and overwrite the attributes
                        of the model on which the method has been called on.
                         */
                        return todo.reload();
                    })
                .then(
                    function (todo) {
                        res.json(todo.toJSON()); //if succesfull response with 200 and res.json(body);
                    })


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
app.delete('/todos/:id',middleware.requireAuthentication , function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    //console.log('deleting-->todoId=' + todoId +'-+-' + 'user=' + req.user.get('id') );

    db.todo.destroy({
        where:{
            id:todoId,
            userId:req.user.get('id')
        }
    }).then(
        function(numberDeleted) {
            if (numberDeleted === 0) {
                res.status(404).send('There is no ToDo to Delete.')
            }
            else {
                res.status(200).json('record number '+ numberDeleted + ' deleted')
            }
        },
        function(){

            res.status(500).send();
        }
    )});

    //idToDelete = _.indexOf(todos, _.findWhere(todos, {id: todoId})); //finds position in array to delete
    ////idToDelete2= _.findWhere(todos, { id : todoId})  //finds whole object in array to delete.
    //
    //if (idToDelete != -1) {
    //    try {
    //        todos.splice(idToDelete, 1);
    //        res.status(200).json({"Succes": "deleted id:" + todoId});
    //    }
    //    catch (e) {
    //        res.status(404).send();
    //    }
    //}
    //else {
    //    res.status(404).json({"error": "No Todo found while deleting"});
    //}

//******UPDATE TODO
app.put('/todos/:id',middleware.requireAuthentication , function (req, res) {
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


    //we use a model method findOneso we can updated it (returns a promise and thus needs 2 call backfunctions.
    //we don't use the Model method but we use the instance method to update

    //console.log('updating->todoId=' + todoId +'-+-' + 'user=' + req.user.get('id') );

    db.todo.findOne({
        where:{
            id:todoId,
            userId:req.user.get('id')
        }
    }).then(             //lookup for id to update.

        function(todo){                        //first call back of the promise(OK) back for findbyid
            if(todo){
                return todo.update(attributes).then(                            //we don't use the Model method but we use the instance method
                                                function(todo){                //follow up when findbyId went well and found
                                                        res.json(todo.toJSON());   //OK(200) and found updated id returned
                                                },function(e){
                                                        res.status(400).json(e);
                                                });
            }
            else{
                res.status(404).send('There is no ToDo to Update.');      //OK but record to updated not found
            }
        },
        function(){                           //second call back of the promise (NOK) back for findByID
            res.status(500).send();
        }
    );



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



//########## USER AND AUTHENTICATION SECTION ################## USER AND AUTHENTICATION SECTION ################## USER AND AUTHENTICATION SECTION ########

app.post('/users', function(req,res){
    // to access body you need to install module "body-parser"

    //prevent extra fields(takes objects and attribute you want to keep)
    var body = _.pick(req.body, 'email', 'password');

    //create returns a promise
    db.user.create(body).then(
        function (user) {
            res.json(user.toPublicJSON()); //if succesfull response with 200 and res.json(body);
            //toPublicJSON is sent to instanceMethod defined in user.js and only public field are filter out.
        },
        function (e) {
            res.status(400).json(e); //if fails return error 400 + error in json

        });



});

app.post('/users/login', function(req,res) {
    // to access body you need to install module "body-parser"

    //creat variable
    var userInstance; // needed to access the user outside the scope of the authenticate function

    //prevent extra fields(takes objects and attribute you want to keep)
    var body = _.pick(req.body, 'email', 'password');

    //calls the classMethod that returns a new promise which
    // //specifies succes(resolve)and the failure(reject)
    // function to be used
    db.user.authenticate(body).then(
        //function for succes(resolve)
        function (user) {
            var token = user.generateToken('authentication'); //call instance method
            userInstance=user;
            return db.token.create({
                token:token              ///set the value of token in tokon.js to datbase
            })
        }).then(
        function (tokenInstance) {

            res.header('Auth',tokenInstance.get('token')).json(userInstance.toPublicJSON());
        }
        ).catch(
        //function for failure(reject)- in case user /pwd combination is not valid
            function (e) {
                res.status(401).send(e.toJSON());
        }
    )

});

app.delete('/users/login',middleware.requireAuthentication, function (req, res) {
    req.token.destroy()
        .then(function () {
            res.status(204).json("You have been logged out");
        }
        ).catch(function () {
        res.status(500).send();
        })
});


//########## GENERAL DATABASE SECTION ################## GENERAL DATABASE SECTION ################## GENERAL DATABASE SECTION ##################


//Call syc and add promise callback function.
db.sequelize.sync(
    //if set to true database will be recreated everytime application starts.
    {force: true}
).then(function () {
    //******START APPLICATION!!!
    app.listen(PORT, function () {
        console.log('Listening on port: ' + PORT)
    });
}).catch(function(error) {
    // whooops
});

