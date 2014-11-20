/**
 * MessagesController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	read: function(req, res) {
        Message.find().exec(function(err, messages) {
            if (err) return res.serverError('DB Error');
            return res.json(messages);
        });
    },

    event: function(req, res) {
        var timeout = setTimeout(function() {
            EventService.unsubscribe(id);
            res.json([]);
        }, 30000);
        var id = EventService.subscribe(function(message) {
            clearTimeout(timeout);
            res.json([message]);
        });
    },

    create: function(req, res) {
        Message.create({
            alias: req.param('alias'),
            text: req.param('text'),
            user: req.session.user,
        })
        .exec(function(err, message) {
            if (err) return res.serverError('DB Error');
            EventService.notify(message);
            res.ok();
        });
    }
};

