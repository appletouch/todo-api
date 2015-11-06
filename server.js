/**
 * Created by PKoolwijk on 1-11-2015.
 */
var express =require('express');
var app = express();
var PORT = process.env.PORT||3000;

app.get('/',function(req,res){
    res.send('Peter\'s ToDo API root');


});

app.listen(PORT, function(){
    console.log('Listening on port: ' + PORT)

})

