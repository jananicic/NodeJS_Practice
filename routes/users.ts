import {Router} from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import passport from 'passport';

const router = Router();

//Login Page
router.get('/login', (req, res, next) => {
    res.render('login');
});

//Register Page
router.get('/register', (req, res, next) => {
    res.render('register');
});

const generateSalt = (rounds: number): Promise<string> => new Promise(((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, salt) => {
        if (err) return reject(err);

        return resolve(salt)
    })
}));

const generateHash = (pass: string, salt: string): Promise<string> => new Promise(((resolve, reject) => {
    bcrypt.hash(pass, salt, (err, hash) => {
        if (err) return reject(err);
        return resolve(hash);
    });
}));

router.post('/register', async (req, res) => {
    const {name, email, password, password2} = req.body;

    if (!name || !email || !password || !password2) return res.render('register', {errors: [{msg: "Please fill in all fields"}], ...req.body});
    if (password !== password2) return res.render('register', {errors: [{msg: "Password do not match"}], ...req.body});
    if (password.length < 6) return res.render('register', {errors: [{msg: "Password should be at least 6 characters"}], ...req.body});

    try {
        const user = await User.findOne({email: email});
        if (user) {
            return res.render('register', {errors: [{msg: "User already exists"}], ...req.body});
        } else {
            const newUser = new User({
                name,
                email,
                password
            });
            const salt = await generateSalt(10);
            const hash = await generateHash(password, salt);
            newUser.password = hash;
            await newUser.save();
            req.flash("success_msg", "You are now registered and can now Login");
            res.redirect('/users/login');
        }
    } catch (err) {
        console.log(err);
        res.render('register', {errors: [{msg: "Internal server error"}], ...req.body});
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

export default router;
