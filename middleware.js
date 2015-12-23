/**
 * Created by PKoolwijk on 22-12-2015.
 */
module.exports= function (db) {
    return{
        requireAuthentication: function (req,res,next) {
            var token =req.get('Auth');
            db.user.findByToken(token).then(                //findByToken returns a Promise
                function (user) {                           //succes or resolve function
                    req.user =user;
                    next();
                },
                function () {                              //failure or reject function
                res.status(401).send();
            })
        }      
    };
};