/**
 * Created by PKoolwijk on 21-12-2015.
 */
var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user',
        {
        /*To define mappings between a model and a table, use the  define
          method. Sequelize will then automatically add the attributes
          createdAt  and  updatedAt  to it. So you will be able to know
          when the database entry went into the db and when it was updated
          the last time. If you do not want timestamps on your models,
          only want some timestamps, or you are working with an existing
           database where the columns are named something else,
           jump straight on to configuration to see how to do that
         */
            email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {isEmail: true}
        },
        salt:{
            type:DataTypes.STRING
        },
        password_hash:{
            type:DataTypes.STRING

        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {len: [4, 100]},
            //function is called with plain text password
            set:function(value){
                var salt= bcrypt.genSaltSync(10);  //number of charakter for salt.
                var hashedPassword = bcrypt.hashSync(value,salt); //takes password and the salt
                this.setDataValue('password',value);
                this.setDataValue('salt',salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    },{
        /*Hooks (also known as callbacks or lifecycle events),
        are functions which are called before and after calls in
        sequelize are executed. For example, if you want to always set
        a value on a model before saving it, you can add a beforeUpdate
         hook.
        * */
        hooks:{
            beforeValidate:function(user,option){
                //user.email
                if(typeof user.email==='string'){
                    user.email =user.email.toLowerCase();
                }

            }
        },
        //receives the json returned after creating a user and filter out the security sensitive info like salt and hashed password
        instanceMethods:{
            toPublicJSON:function(){
                var json = this.toJSON();
                return _.pick(json,'id','email','createdAt','updatedAt' );
            }
        }

    })
};