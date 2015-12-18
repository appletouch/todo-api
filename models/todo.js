/**
 * Created by PKoolwijk on 15-12-2015.
 */

//export special function to be imported
//DataTypes has all datatypes from sequelize
module.exports = function (sequelize, DataTypes) {

    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {len: [1, 250]}
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    })

};