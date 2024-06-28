import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true // to make a feild searchable optimizely 
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true
        },
        coverImage: {
            type: String // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video"
            }
        ],
        password: {
            type: String, // it should be encrypted but for matching, we have to store it as string
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true // it will give us fields like createdAt and updatedAt
    })

// MIDDLEWARE --> "pre" hook: work just before, when data is saving

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

/*

Here, we want to use the middleware
        on which --> (userSchema) model "(this) pointer will refer it" 
        what middleware --> pre "tag"
            - on what functionality/when it should execute --> just before saving (save)
            - call back/what will be result after execution --> run async function 
here, we don't write callback as "() => {}" cause in javacript refering "this" keyword
is not easy, as we have no context to define "this" 
thats why, we write callback as "function () {}" but as we are using the encryption,
it takes time and consume CPU to process, that's why we use "async" keyword to define
that, this function will going to take some time.
            - as we using middleware, it is required to use (next) tag
            

            - as we used (next) tag --> it is reuired to call (next) flag in the end
                                to pass on to the next function, what we have done



userSchema.pre its a hook here("save"it is a method, async function (next) { 
    // Using "IF condition as checker"
    if(
        !this.isModified("password") // checking, if the required field is not modified
        also called negative check as negative check will hit more often.
    ) return next(); // skip the commands underneath and move to the next function/method

as we dont want to run the defined function each and everytime as its un-necessary
because, when we want to save the password in real?
    1) when i will signup as i will save my password for the first time.
    2) when we modify our current password.
Cause only at that moment we get password field in response 
that's why when it's necessary, only then it should run.

that's why we used an "if command" to check  our required condition 

    this.password = the field we want to encrypt 
    bcrypt.hash(
        this.password, // what to encrypt
        10 // on what round (encryption algorithm, it can be from 1 to 10)
        ) 

the function we want to execute OR how we want to encrypt 
here, we want to encrypt the password 

    next() 

must, as as we using a middleware, For Eg. we are trying to encrypt before saving,
so, it is required to call next function once we are done with our functionality. 
i.e., we return to the main function after our current middleware execution
    

})
*/

// Writing Custom Methods
// For Authenticating the password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

/*
 For ? - userSchema
what to add ? - method (methods)
what method ? - isPasswordCorrect (custom method name)
what function the custom method belongs to - //async function(). why?
cause this function works with cryptography. that's why we use async tag on function

this async function() holds
    1) parameter ()- password (in our case as that is what we want to check)
    2) callback {} - checking password (in our case)
        2.1) await bcrypt.compare(): 
            a) await tag -  as bcrypt is a cryptography, 
            it takes time to compute. That's why we use await keyword
            b) bcrypt - class
            c) compare - method : It ask for 2 parameters 
                i)  password : clear text password used/typed/saved by the user 
                ii) this.password : Encrypted password from bcrypt for the user's provided password 
                it will compare both the things to varify
                iii) compare method returns the value as true or false.
 */

// JWT is a bearer token means the user who holds this JWT token is the valid user
// the one who gives me this token, i will send the data to that person
// We don't use async keyword as they run fast.
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {// payload
            _id: this._id,
            // You can add as many fields as you want, but id is mendatory
            // ,email: this.email
            // ,username: this.username
            // ,fullName: this.fullName
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
/**
 sign method in jwt class helps in generating random password
 */

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {// payload
            _id: this._id      
        },
        process.env.REFRESH_TOKEN_SECRET, //secretOrPrivateKey
        { // object - to store time period
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("user", userSchema)