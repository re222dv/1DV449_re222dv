/**
 * MessagesController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	read: function(req, res) {
        Message.find().exec(function(err, messages) {
            if (err) return res.send(500, 'DB Error');
            return res.json(messages);
        });
    },

    create: function(req, res) {
        Message.create({
            alias: req.param('alias'),
            text: req.param('text'),
            user: req.session.user,
        })
        .exec(function(err) {
            if (err) return res.send(500, 'DB Error');
            res.ok();
        });
    }
};

