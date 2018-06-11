"use strict";

class Engine {

    // Constructor
    constructor(logger) {

        this._logger = logger;
        this._interval = null;

        this.log = function(message) 
        { 
            this._logger.log(message, this._logger.logLevel);
        }

        this.tick = function()
        {
            this._logger.log("TICK", this._logger.logLevel);
        }
    }

    start() 
    {
        this.log("Terranova engine is starting up...")
        this._interval = setInterval(this.tick, 3000);
    }  
}

module.exports = Engine;