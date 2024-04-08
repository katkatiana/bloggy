/**
 * @fileoverview github.js
 * This route contains all routing methods related to the oauth login with github.
 * @author Mariakatia Santangelo
 * @date   08-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const github = express.Router();
const strategy = require('passport-github').Strategy;
const passport = require('passport');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const userModel = require('../models/users');
const crypto = require('crypto');
const { log } = require('console');
const axios = require('axios');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
require('dotenv');

/** Set the transporter (object) able to send an email with nodemailer library */
let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

/** Set the responsive HTML emails with Mailgen library */
let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Bloggy',
        link: process.env.FRONTEND_URL
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

let userEmail = ""

/** Configuration of router in order to connect to our personal github app through secret keys. */
github.use(
    session(
        {
            secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
            resave: false,
            saveUninitialized: false
        }
    )
)

/** passport middleware initialization */
passport.use(passport.initialize());
passport.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user)
});
passport.deserializeUser((user, done) => {
    done(null, user)
});

/**
 * This function gets the github user email in order to pass it to db model to store it in our db.
 * It is necessary to do so since github can have private emails users.
 * @param {*} accessToken is generated when an user logs in through github. It is necessary to be authorized to request user's email.
 * @returns the email of the github user now registered also in our db.
 */
const getUserEmail = async (accessToken) => {
    let userEmail = '';
    await axios(
        {
            method: 'get',
            url: 'https://api.github.com/user/emails',
            headers: {
                "Authorization": "Bearer " + accessToken,
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28"            
            }
        }
    )
    .then((res) => {
        if(res.status === 200) {
            userEmail = res.data[0].email
        }
    })
    .catch((err) => {
        console.log("error", err)
    })

    return userEmail
} 

/**
 * Route to add a new user to db who logged in for the first time through github auth.
 * It also sends an email (sent through nodemailer and structured with MailGen library) if the signup is succesful.
 * It checks the previous existence of user in db and only if not found, it saves the user as a new one.
 * If it has to save the new user, it generates a temporary password (tempPassword variable) to be sent to the user email in order to log in not necessarely through github again in the future.
 */
passport.use(
    new strategy(
        {
            clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
            clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
            callbackURL: process.env.OAUTH_GITHUB_CALLBACK
        },
        async (accessToken, refreshToken, profile, done) => {            
            userEmail = await getUserEmail(accessToken)
            const user = await userModel.findOne({email: userEmail})

            if(!user){                
                const { _json } = profile                
                const name = _json.name.split(" ");                
                const tempPassword = crypto.randomBytes(10).toString('hex');
                const saltRounds = 10;
                const email = {
                    body: {
                        name: name[0] + " " + name[1],
                        intro: [
                            'Welcome to Bloggy! We\'re very excited to have you on board.', 
                            'Since you\'ve signed in with an external login service, we\'ve generated a temporary password for you!',
                            'You\'ll find it below.',
                            tempPassword,
                            'You can use it together with your email address in order to login without external services.',
                            'If you want to change it, you can do so in your profile settings.'
                        ],
                        outro: 'Need help, or have questions? Just send an email to info@bloggy.com, we\'d love to help.'
                    }
                };
            
                let mailOptions = {
                    from: process.env.EMAIL_SENDER,
                    to: userEmail,
                    subject: 'Welcome to Bloggy',
                    html: mailGenerator.generate(email),
                    text: mailGenerator.generatePlaintext(email)
                };            
                const newUser = new userModel(
                    {
                        firstName: name[0],
                        lastName: name[1],
                        email: userEmail,
                        pswHash: await bcrypt.hash(tempPassword, saltRounds),
                        avatar : _json.avatar_url,
                        dateOfBirth: '01/01/2000'
                    }
                )
                await newUser.save()
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        throw new Error(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }

            return done(null, profile)
        }
    )
)

/**
 * Route to get the new github authenticated user.
 */
github.get("/auth/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    const user = req.user;
    const redirectUrl = process.env.FRONTEND_URL + `/success?user=${JSON.stringify(user)}`

    res.redirect(redirectUrl);
})

/**
 * Route to get the new github authenticated user for generating a new token with the same model as other stored users.
 */
github.get("/auth/github/callback", passport.authenticate('github', {failureRedirect: '/'}), (req, res) => {
    const user = req.user;    
    //const token = jwt.sign(user, process.env.SECRET_KEY);
    const token = jwt.sign(
        {
            firstName: user.displayName.split(" ")[0],
            lastName: user.displayName.split(" ")[1],
            email: userEmail,
            avatar: user._json.avatar_url
        }, process.env.SECRET_KEY, {
            expiresIn: '24h'
        }
    )
    const redirectUrl = process.env.FRONTEND_URL+ `/success?token=${token}`
    res.redirect(redirectUrl);
})

/**
 * Route to accept the new user and transfer it to the home with its authentication token previously generated.
 */
github.get("/success", (req, res) => {
    res.redirect("/home");
})

module.exports = github;