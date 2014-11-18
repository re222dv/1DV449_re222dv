/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function (req, res) {
        var username = req.param('username');
        var password = req.param('password');

        User.findByUsername(username).exec(function(err, users) {
            if (err) {
                res.send(500, { error: 'DB Error' });
            } else {
                if (users.length) {
                    var user = users[0];
                    if (PasswordService.verify(password, user.hash)) {
                        req.session.user = user;
                        res.send('Hello ' + user.username);
                    } else {
                        res.send('Username or Password is invalid');
                    }
                } else {
                    res.send(404, { error: 'User not Found' });
                }
            }
        });

        //res.view();
    }
};

