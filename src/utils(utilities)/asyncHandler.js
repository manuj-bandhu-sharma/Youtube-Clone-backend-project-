//const asyncHandler = () => {}

const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(// if request is resolved/success -(then)-> what?
            requestHandler(req, res, next)
        ).catch(// If request is failed -(then)-> what?
            (error) => next(error)
        )
    }
}
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