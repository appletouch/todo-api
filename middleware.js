/**
 * Created by PKoolwijk on 22-12-2015.
 */

var cryptojs = require('crypto-js');

module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth' || '');   //find the token stored in the haders of the request

            //looking for a token in the database which was created with a valid login.
            db.token.findOne({
                where: {tokenHash: cryptojs.MD5(token).toString()}    //is the hased value of the Auth header
            }).then(                           //if we find a token
                function (tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }
                req.token = tokenInstance;     //store on the response
                return db.user.findByToken(token);  // start new chain and find user
            }).then(function (user) {
                req.user = user;
                next();                            // processed execution.
            }).catch(function () {
                res.status(401).send()
            })

        }
    }
};
