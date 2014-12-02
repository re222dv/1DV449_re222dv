var Deferred = require("promised-io/promise").Deferred;
var fs = require("promised-io/fs");
var Hapi = require("hapi");
var request = require('request');

const FIVE_MINUTES = 1000 * 60 * 5;

var server = new Hapi.Server(9099, { cors: true });

server.route({
    path: '/traffic',
    method: 'GET',
    handler: function(_, reply) {
        getData().then(function (data) {
            reply({messages: data});
        }, function(err) {
            throw err;
        });
    }
});

function cacheData(data) {
    return fs.writeFile('cache', JSON.stringify({data: data, timestamp: Date.now()})).then(function () {
        return data;
    }, function() {
        console.log('caching failed');
        return data;
    });
}

function getData() {
    return fs.readFile('cache').then(function(content) {
        var cachedData = JSON.parse(content);

        if (Date.now() - cachedData.timestamp < FIVE_MINUTES) {
            console.log('cached');
            return cachedData.data;
        }

        return getTrafficMessages(cachedData.timestamp).then(function (data) {
            if (data == null) data = cachedData.data;

            return cacheData(data);
        });
    }, function () {
        return getTrafficMessages().then(function (data) {
            return cacheData(data);
        });
    });
}

function getTrafficMessages(timestamp) {
    var deferred = new Deferred();

    var options = {
        uri: 'http://api.sr.se/api/v2/traffic/messages?size=1000&format=json',
        json: true,
    };

    if (timestamp) {
        options['headers'] = {'If-Modified-Since': new Date(timestamp).toUTCString()};
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = body.messages;
            data = data
                .map(function(message) {
                    message.createddate = new Date(+message.createddate.slice(6, -7)).getTime();
                    return message;
                })
                .sort(function(a, b) {
                    return b.createddate - a.createddate;
                })
                .slice(0, 100);

            deferred.resolve(data);
        } else if (!error && response.statusCode == 304) {
            deferred.resolve(null);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

if (!module.parent) {
    server.start(function() {
        console.log("Server started", server.info.uri);
    });
}

module.exports = server;
