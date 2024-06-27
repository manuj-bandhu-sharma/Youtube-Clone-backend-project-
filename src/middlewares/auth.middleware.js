import { APIError } from "../utils(utilities)/APIError.js";
import { asyncHandler } from "../utils(utilities)/asyncHandler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.model.js";


// Verify if User logged In or not //
export const verifyJWT = asyncHandler(async(req, _, next) => { // here res changed to _ as it was empty
    // Why in try catch? cause we trying a database function which might fail to execute
    try {
        // As this is a middleware, we require to pass it once it done. that's why we used "next" keyword 
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    // Storing the access token, using the cookies from request body(for web users) or from header (for mobile users) 
        if (!token) {
            // If token doesn't exist. then throw an error
            throw new APIError(401, "Unauthorized request")
        }
        // If user exist/valid, verify and decode what this token holds
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // jwt will verify the encoded token once we provide the required secret key. that's why we imported assess token key here to decode the token
    
        const USER = await user.findById(decodedToken?._id).select("-password -refreshToken")
        // used await cause i want to run a database query
    
        if (!USER) {
            throw new APIError(401, "Invalid Access Token")
        }
    
        req.USER = USER;
        next()
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid Access Token")
    }

})