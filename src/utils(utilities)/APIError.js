class APIError extends Error { // to standardadized the API errors, if any occur
    // we made a extention name APIError where we add some required fields
    constructor( // defining the js object properties to constructor method
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    // Note:-
    // If you do not define a constructor method, JavaScript will add an empty constructor method.
    ){ // function overwrite with the help of extend keyword
        super (message) // activating all the properties of the constructor method
        this.statusCode = statusCode // statusCode will be same as it is getting
        this.data = null // no data is required with this extension
        this.message = message // the defined message it will throw if message required 
        this.success = false // this is false as we handling errors not response
        this.errors = errors // errors will be same as it stored in defined array

        if (stack) {// if we have stack or not
    /*
It is important, to have stach trace 
to understand what problem we have in which file
Example:- For API Errors in our current scenario.  
    */
            this.stack = stack // provide statck if available
        }else{ // otherwise, writting a small function
            Error.captureStackTrace(this,this.constructor) // a small function toget the desired response
     // this -> reference
// and, this.constructor -> passed its instance, to understand in which context are we talking 
        }
    }
}

export {APIError}
