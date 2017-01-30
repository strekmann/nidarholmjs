import uuid from 'node-uuid';
import RememberMeToken from '../models/RememberMeToken';

export default function persistentLoginMiddleware(req, res, next) {
    if (req.body.username && !req.body.remember_me) {
        return next();
    }
    const token = new RememberMeToken();
    token._id = uuid.v4();
    token.user = req.user._id;
    return token.save((err) => {
        if (err) { return next(err); }
        res.cookie('remember_me', token, {
            path: '/',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        return next();
    });
}
