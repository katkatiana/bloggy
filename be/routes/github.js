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

/******** Variables Section  ****************************************************/

/** Transporter object needed to send an email with nodemailer library */
let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

/** Mailgen instance, needed to create responsive and modern-looking HTML emails through Mailgen library */
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

/** 
 * Stores the user email retrieved from the github API.
 * This is needed since passport-github is buggy because when the oauth process is
 * successful, the github user email is returned as null even if the email is set
 * to be public.
 * We retrive the email using the api endpoint so we are sure to get the correct one.
 * That email is stored in the below variable.
 */
let userEmail = ""

/******** Initialization Section  ****************************************************/

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

/******** Function Section  ****************************************************/

/**
 * This function gets the github user email in order to pass it to db model to store it in our db.
 * It is necessary to do so since github users can have private email.
 * Furthermore, passport-github is buggy because when the oauth process is successful, the github user email is returned as null even if the email is set to public.
 * @param {*} accessToken Token generated when an user successfully logs in through github. It is necessary to request user's email.
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
 * This middleware handles the oauth github login process.
 * The async code gets executed when the access is performed successfully, then
 * the accessToken is received along with the profile of the logged user.
 * In that case, we check for the existence of the user based on the email (retrieved with explicit API call to github endpoint, since the one returned
 * in the profile object is always null due to passport bug).
 * If the user does not exist on the db, we register it and we also send a welcome email (as we do for other standard users).
 * Anyway, for the user to be stored in the db a password is needed: we generate a random temporary password, which is sent
 * in the welcome email, and the hash of this password will be stored in the db.
 * Then the user will have the possibility to update this temp password.
 * WIth this mechanism, the user will be able to log in not necessarily through github again in the future.
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
 * Route invoked by frontend to start github oauth login process.
 */
github.get("/auth/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    const user = req.user;
    const redirectUrl = process.env.FRONTEND_URL + `/success?user=${JSON.stringify(user)}`

    res.redirect(redirectUrl);
})

/**
 * Callback route called by github oauth when the authentication is performed correctly.
 * In this route we use the information provided by github to build a new token with the same model as other stored users.
 * The new token is returned as URL query string.
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

github.get("/success", (req, res) => {
    res.redirect("/home");
})

module.exports = github;