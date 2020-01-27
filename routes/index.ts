import {Router} from 'express';
import {ensureAuthenticated} from '../config/auth';

const router = Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('welcome');
});

router.get('/dashboard', ensureAuthenticated, (req, res, next) => {
    res.render('dashboard', {
        name: req.user.name
    });
});

export default router;
