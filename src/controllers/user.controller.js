import { asyncHandler } from "../utils(utilities)/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // Here async method is being used as parameter -in place of-> requestHandler
    res.status(200).json({ message: "ok" })
})

export{registerUser} // exporting as an object

// we import this to app.js file