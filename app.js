// Required libs
var express = require('express');
var app = express();
var path = require('path');
var Logger = require('./logger.js');
var Engine = require('./engine.js');

// Global variables
var logger = new Logger("info");

// Fire up Express
try
{
    app.use(function(req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        logger.log("Connection received from " + ip + ".", "info");
        next(); // Passing the request to the next handler in the stack.
    });

    app.use('/', express.static(__dirname + '/'));

    app.listen(8080, function() { 
        logger.log("TerraMoon is starting up...", "error");
        logger.log('Listening on port 8080...', "error")
        main(); // Start the main game loop
    });
}
catch (e)
{
    logger.log(e, "error");
}

// Main game loop
function main()
{
    var engine = new Engine(logger);

    // Launch the beast
    engine.start();
}
