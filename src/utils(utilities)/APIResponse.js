class APIResponse{ // whenever we send a response to a client it will go through this class
    constructor(
        statusCode, // if we sending data so we require status-code to understand the response
        data, // it is mendatory that if a API calls successfully then a message should go
        message = "Success" // as its a API response
    ){// Over-write
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // as it is a response to follow the standard of API status code used by big companies
        //its not mendatory but required
    }
}

export {APIResponse}