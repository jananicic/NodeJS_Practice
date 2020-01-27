import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import session from 'express-session';
import passport from 'passport';
import {mongoURI} from "./config/keys";
import passportValidation from './config/passport';
import home from './routes';
import users from './routes/users';

const app = express();

// Passport conf
passportValidation(passport);

// Connect to Mongo
mongoose.connect(mongoURI, {useNewUrlParser: true})
    .then(() => console.log("MongoDB Conected..."))
    .catch(console.log);

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({extended: false}));

// Express Session
app.use(session({
    secret: "Jan is nice",
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

//ROUTES
app.use('/', home);
app.use('/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port: ${PORT}`));
