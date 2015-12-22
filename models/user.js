/**
 * Created by PKoolwijk on 21-12-2015.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {isEmail: true}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {len: [4, 100]}
        }
    },{
        hooks:{
            beforeValidate:function(user,option){
                //user.email
                if(typeof user.email==='string'){
                    user.email =user.email.toLowerCase();
                }

            }
        }
    })
};