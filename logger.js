// Global variables
var Logger;

// Constructor
Logger = (function() {

    Logger.prototype.logLevel = "";

    function Logger(logLevel)
    {
        if (logLevel)
            this.logLevel = logLevel;
    }

    Logger.prototype.log = function(message, level)
    {
        try
        {
            level = level.toLowerCase();
    
            switch (this.logLevel.toLowerCase())
            {
                case "info": // Log everything
                {
                    console.log(new Date().toString() + ": " + message);
                    break;
                }
                case "warn": // Log warnings and errors only
                {
                    if (level != "info")
                    {
                        console.log(new Date().toString() + ": " + message);
                    }
                    break;
                }
                case "error": // Log errors
                {
                    if (level != "info" && level != "warn")
                    {
                        console.log(new Date().toString() + ": " + message);
                    }
                    break;
                }
            }
        }
        catch(e)
        {
            // Do nothing and stay lossless
        }
    }
  
    return Logger;
  
  })();

  module.exports = Logger; 