var Message = Message || {};

Message.create = function(message) {
    var date = new Date(message.createdAt);

    return Object.freeze({
        get alias() {return message.alias;},
        get text() {return message.text;},
        get date() {return date;},
    });
};
