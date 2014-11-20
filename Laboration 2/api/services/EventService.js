var observers = {};

module.exports = {

    notify: function(argument) {
        Object.keys(observers).forEach(function(id) {
            observers[id](argument);
        });
    },

    subscribe: function(callback) {
        var id = Math.random();
        observers[id] = callback;
        return id;
    },

    unsubscribe: function(id) {
        delete observers[id];
    },
};
