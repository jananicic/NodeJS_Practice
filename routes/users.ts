const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');


//Login Page
router.get('/login', (req, res, next) => {
    res.render('login');
});

//Register Page
router.get('/register', (req, res, next) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({msg: "Please fill in all fields"});
    }

    // Check if passwords match
    if (password !== password2) {
        errors.push({msg: "Password do not match"});
    }

    // Check pass length
    if (password.length < 6) {
        errors.push({msg: "Password should be at least 6 characters"})
    }

    if (errors.length > 0) {
        res.render('register', {errors, ...req.body});
    } else {
        // Validation passed
        User.findOne({email: email})
            .then(user => {
                // User exists
                if (user) {
                    errors.push({msg: "User already exists"});
                    res.render('register', {errors, ...req.body});
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    // Hash password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(() => {
                                    req.flash("success_msg", "You are now registered and can now Login");
                                    res.redirect('/users/login');
                                })
                                .catch(console.log);
                        }))
                }
            })
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res, next) => {
   req.logout();
   req.flash('success_msg', 'You are logged out');
   res.redirect('/users/login');
});

module.exports = router;
