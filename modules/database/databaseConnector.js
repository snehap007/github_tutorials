var mysql = require('mysql');
var path = require('path');
var config = require(path.resolve('./', 'config'))
logger = require(path.resolve('./logger'))

var con = mysql.createConnection({
    host: config.databaseHost,
    user: config.databaseUser,
    password: config.databasePassword,
    database: config.databaseDatabaseName,
    multipleStatements: true
});

myFunction();

function myFunction() {
    setTimeout(function(){ 
        con.connect(function (err) {
            if (err) {
                logger.error('Error connecting to Database', err)
                console.log('Error connecting to Database');
                return;
            }
        
            logger.info('Connection established')
            console.log("Started iteration on - " + new Date());
            console.log("Connection established");
        });
    }, 3000);
}

module.exports = con;