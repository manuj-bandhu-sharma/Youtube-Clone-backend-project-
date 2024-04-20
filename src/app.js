import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

// Assigning MIDDLE-WARES
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) // limit the json size
// so that it doesn't crashes when our server gets a heavy json files.

app.use(express.urlencoded({extended:true, limit:"16kb"}))// to access the data coming from url

app.use(express.static("public")) // its a folder
/* 
    if i want to store some files, images or videos on my server(temporarily) 
    so, i will gonna keep them in a folder name "public" 
    like a folder which is accessible publically
*/

app.use(cookieParser())//To use CURD operation on cookie's on client's browser 

export {app}
