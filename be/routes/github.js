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

let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Bloggy',
        link: 'http://localhost:3000'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
});

let userEmail = ""

github.use(
    session(
        {
            secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
            resave: false,
            saveUninitialized: false
        }
    )
)

passport.use(passport.initialize());
passport.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user)
});
passport.deserializeUser((user, done) => {
    done(null, user)
});

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
                const name = _json.name.split(" ")                
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

github.get("/auth/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    const user = req.user;
    const redirectUrl = `http://localhost:3000/success?user=${JSON.stringify(user)}`

    res.redirect(redirectUrl);
})

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
    const redirectUrl = `http://localhost:3000/success?token=${token}`
    res.redirect(redirectUrl);
})

github.get("/success", (req, res) => {
    res.redirect("/home");
})

module.exports = github;