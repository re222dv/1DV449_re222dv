var Message = Message || {};

Message.create = function(message) {
    var date = message.createdAt ? new Date(message.createdAt) : new Date();

    return Object.freeze({
        get alias() {return message.alias;},
        get text() {return message.text;},
        get date() {return date;},
    });
};
