/**
 * Created by PKoolwijk on 25-12-2015.
 */
var cryptojs = require('crypto-js');

module.exports= function (sequelize, DataTypes) {
    return sequelize.define('token',
        {
            token: {
                type: DataTypes.VIRTUAL,
                allowNull: false,
                validate: {
                    len: [1]
                },
                set: function (value) {
                    var hash = cryptojs.MD5(value).toString();
                    this.setDataValue('token', value);  //if you overwrite a field you still have to set it.
                    this.setDataValue('tokenHash', hash);

                }
            },
            tokenHash:DataTypes.STRING
        })
};