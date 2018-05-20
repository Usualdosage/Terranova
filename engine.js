// Global variables
var Engine;

// Constructor
Engine = (function() {

    Engine.prototype.logger = "";
    Engine.prototype.interval = "";

    function Engine(logger)
    {
        if (logger)
            this.logger = logger;
    }

    Engine.prototype.start = function()
    {
        logger.log("Engine is starting...")

        this.interval = setInterval(function() { 
            logger.log("TICK");

        }, 3000);
    }
  
    return Engine;
  
  })();

  module.exports = Engine; 