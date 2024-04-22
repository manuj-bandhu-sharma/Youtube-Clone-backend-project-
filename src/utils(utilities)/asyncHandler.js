//const asyncHandler = () => {}

const asyncHandler = (requestHandler) => {// Its a higher order function which accepts a function
    return (req, res, next) => { // CallBack as Return function
        Promise.resolve(// if request is resolved/success -(then)-> what?
            requestHandler(req, res, next)
        ).catch(// If request is failed -(then)-> what?
            (error) => next(error)
        )
    }
}
/*NOTE:
Here, higher order function means that we except a function and also return a function
that's what we perform in promise, return on the behalf of what you accept.
*/
export {asyncHandler}


    /*
const asyncHandler = () => {}
const asyncHandler = (fun) => () => {}
const asyncHandler = (fun) => {() => {}} // this is same as the one below
const asyncHandler = (fun) => async() => {}
    */


    /*
const asyncHandler = (fn) => async(req, res, next) => {
    try {
        await fn(req, res, next)
        } 
    catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
    */