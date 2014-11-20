/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index: function (req, res) {
        if (req.session.user) {
            res.redirect('/chat');
        }
        res.view('login', {failed: false});
    },

	login: function (req, res) {
        var username = req.param('username');
        var password = req.param('password');

        User.findByUsername(username).exec(function(err, users) {
            if (err) {
                res.serverError('DB Error');
            } else {
                if (users.length) {
                    var user = users[0];
                    if (PasswordService.verify(password, user.hash)) {
                        req.session.user = user;
                        res.redirect('/chat');
                    } else {
                        if (req.session.user) req.session.user = null;
                        res.view('login', {failed: true});
                    }
                } else {
                    if (req.session.user) req.session.user = null;
                    res.view('login', {failed: true});
                }
            }
        });
    },

    logout: function (req, res) {
        req.session.user = null;
        res.redirect('/');
    },
};

