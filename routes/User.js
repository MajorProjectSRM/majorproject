const express = require('express')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
var url = require('url');
const User = require('../models/user')
var jwtDecode = require('jwt-decode');
users.use(cors())

process.env.SECRET_KEY = 'secret'

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); 
}
var temp = []
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'girishgarg9999@gmail.com',
        pass: '9460663999ss'
    }
});

users.post('/register', (req, res) => {
    if (req.body.token) {
        fLen = temp.length;
        for (i = 0; i < fLen; i++) {
            if (req.body.token === temp[i]) {
                res.send('/dash')
            }
        }
    } else {
        const today = new Date()
        const userData = {
            user_name: req.body.user_name,
            email: req.body.email,
            password: req.body.password
        }
        let errors = [];
        if (errors.length > 0) {
            // res.send("register", { errors, userData.name, userData.email, password, password2 });
        } else {
            User.findOne({
                where: {
                    email: req.body.email
                }
            })
            .then(users => {
                    if (!users) {
                        bcrypt.hash(req.body.password, 10, (err, hash) => {
                            function Store(pass) {
                                var mailOption = {
                                    from: 'girishgarg9999@gmail.com', // sender this is your email here
                                    to: req.body.email, // receiver email2 
                                    subject: "Account Verification",
                                    html: `<h4>Hello ,Please Click on this link to verify you account<h4><br><hr>
                                    <br><a href="http://localhost:3000/users/verification/?em=${userData.email}">
                                    CLICK ME TO ACTIVATE YOUR ACCOUNT</a>`
                                }
                                transporter.sendMail(mailOption, (error, info) => {
                                    if (error) {
                                        console.log(error)
                                    } else {
                                        userData.password = hash
                                        User.create(userData)
                                            .then(users => {
                                                console.log("testing")
                                                let mailSend = { status: 'mail send to this email address: ' + users.email }
                                                res.send(mailSend)
                                            })
                                            .catch(err => {
                                                res.send('error: ' + err)
                                            })
                                        }
                                    });
                                }
                            Store(hash);
                        })
                    } else {
                        let mailAlreadyExist = { status: 'this mail is already exist: ' + users.email }
                        res.send(mailAlreadyExist)
                    }
                })
                .catch(err => {
                    console.log('error: ' + err)
                })
        }
    }
})

users.get('/verification/', (req, res) => {

    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log(qdata.em);
    var ud = {
        verified: true
    }
    User.findOne({
            where: {
                email: qdata.em
            }
        })
        .then(users => {
            console.log("hello duniya");
            users.verified = true
            users.save();
            res.redirect("/login.html")
        })

})

users.post('/login', (req, res) => {
        if (req.body.token) {
            var decoded = jwtDecode(req.body.token);
            fLen = temp.length;
            for (i = 0; i < fLen; i++) {
                if (req.body.token === temp[i]) {
                    res.redirect('/draw.html')
                }
            }
        } else {
            User.findOne({
                    where: {
                        email: req.body.email
                    }
                })
                .then(users => {
                    if (users) {
                        if (users.verified === true) 
                        {
                            if (bcrypt.compareSync(req.body.password, users.password)) 
                            {
                                let token = jwt.sign(users.dataValues, process.env.SECRET_KEY, {
                                    expiresIn: 140000000000
                                })
                                temp.push(token);
                                console.log(token)
                                res.redirect("/draw.html")
                                res.send(token)
                            } else {
                                res.send("Invalid Password")
                            }
                        }
                        else{
                            res.send("User is not verified")
                        }
                    } 
                    else{
                        res.send("user does not exist")
                    }
                })
                .catch(err => {
                    res.status(400).json({ error: err })
                })
            }
    })

users.post("/forgotPassword", (req, res) =>{
    const userData = {
        email: req.body.email,
        password: req.body.password
    }
    User.findOne({
        where: {
            email: req.body.email
        }
    })
    .then(users => {
        console.log(users);
        if (users != null) {
            var mailOption = {
                from: 'girishgarg9999@gmail.com', // sender this is your email here
                to: req.body.email, // receiver email2 
                subject: "Change Password",
                html: `<h4>Hello ,Please Click on this link to Change Your Password<h4><br><hr>
                <br><a href="http://localhost:3000/users/changePassword/?em=${userData.email}&emp=${userData.password}">
                CLICK ME TO CHANGE YOUR PASSWORD</a>`
            }
            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log("testing purpose")
                    let mailSend = { status: 'mail send to this email address: ' + users.email }
                    res.send(mailSend)
                    }
                });       
        } else {
            let userNotExist = { status: 'this emailId is not register: ' + req.body.email }
            res.send(userNotExist)
        }
    })
    .catch(err => {
        console.log('error: ' + err)
    })
})

users.get('/changePassword', (req, res) => {    
    var q = url.parse(req.url, true);
    var qdata = q.query;
    console.log("email",qdata.em);
    console.log("paww",qdata.emp);
    const userData = {
        password: qdata.emp
    }
    User.findOne({
            where: {
                email: qdata.em
            }
        })
        .then(users => {
           bcrypt.hash(qdata.emp, 10, (err, hash) => {
            function Store(pass) {
                userData.password = hash
                users.password = userData.password
                users.save();
                console.log("Updated Successfully");
                res.redirect("/login.html")
            }
            Store(hash)
           })
        })
        .catch(err =>{
            console.log('error: ' + err)
        })

})

users.post('/logout', (req, res) => {
    console.log(req.body.token);
    let fLen = temp.length

    for (i = 0; i < fLen; i++) {
        console.log("here");

        if (req.body.token == temp[i]) {
            temp.pop[temp[i]]
            console.log("here");
            res.send("loggedout")

        }
    }
})

module.exports = users