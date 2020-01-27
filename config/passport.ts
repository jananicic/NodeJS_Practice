import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';

// Load user model
import User from '../models/user';

const comparePasswords = (password: string, userPassword: string): Promise<boolean> => new Promise((resolve, reject) => {
    bcrypt.compare(password, userPassword, (err, isMatch) => {
        if (err) return reject(err);
        return resolve(isMatch)
    });
});

export default (passport) => {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
            // Match user
            try {
                const user = await User.findOne({email: email});
                if (!user) return done(null, false, {message: "That email is not registered"});
                // Match password
                const isMatched = await comparePasswords(password, user.password);
                if (isMatched) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: "Password is incorrect"});
                }
            } catch (err) {
                return done(null, false, {message: 'Internal server error.'});
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
