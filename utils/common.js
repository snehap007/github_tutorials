var mysql = require('mysql');
var path = require('path');
var db = require(path.resolve('.', 'modules/database/databaseConnector.js'));

var config = require(path.resolve('./', 'config'))

exports.getDataByFreshConnection =  function(sqlQuerry,email, callback) {
    var con = mysql.createConnection({
        host: config.databaseHost,
        user: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseDatabaseName
    });

    con.connect(function (err) {
        if (err) throw err;
        con.query(sqlQuerry,email, function (err, result, fields) {
            if (err) {
                throw err
                callback(undefined,err)
            }
            else {
                console.log(result);
                callback(result,undefined)
            }
        });
    });
}

