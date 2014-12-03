var promise = require("promised-io/promise");
var fs = require("promised-io/fs");
var Hapi = require("hapi");
var request = require('request');

const FIVE_MINUTES = 1000 * 60 * 5;
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6;

var server = new Hapi.Server(9099, { cors: true });

server.route({
    path: '/traffic',
    method: 'GET',
    handler: function(_, reply) {
        getData().then(function (data) {
            reply(data);
        }, function(err) {
            throw err;
        });
    }
});

server.route({
    path: '/area',
    method: 'POST',
    handler: function(req, reply) {
        updateArea(req.payload.name, req.payload.longitude, req.payload.latitude).then(function () {
            reply('saved');
        }, function(err) {
            throw err;
        });
    }
});

function cacheData(areas, messages) {
    var data = {areas: areas, messages: messages, timestamp: Date.now()};
    return fs.writeFile('cache', JSON.stringify(data)).then(function () {
        return data;
    }, function() {
        console.log('caching failed');
        return data;
    });
}

function getData() {
    return fs.readFile('cache').then(function(content) {
        var cachedData = JSON.parse(content);

        return promise.all([
            getAreas(cachedData.timestamp),
            getTrafficMessages(cachedData.timestamp),
        ]).then(function (data) {
            if (data[0] == null) data[0] = cachedData.areas;
            if (data[1] == null) data[1] = cachedData.messages;

            return cacheData(data[0], data[1]);
        });
    }, function () {
        return promise.all([
            getAreas(),
            getTrafficMessages(),
        ]).then(function (data) {
            return cacheData(data[0], data[1]);
        });
    });
}

function updateArea(name, longitude, latitude) {
    return fs.readFile('cache').then(function(content) {
        var cachedData = JSON.parse(content);

        cachedData.areas.filter(function (area) {
            return area.name == name;
        })
        .map(function (area) {
            area.longitude = longitude;
            area.latitude = latitude;
            return area;
        });
        return fs.writeFile('cache', JSON.stringify(cachedData));
    });
}

function getAreas(timestamp) {
    if (Date.now() - timestamp < SIX_MONTHS) {
        var deferred = new promise.Deferred();
        deferred.resolve(null);
        return deferred.promise;
    }

    return getRequest('http://api.sr.se/api/v2/traffic/areas?size=100&format=json', timestamp).then(function (data) {
        return data.areas;
    });
}

function getTrafficMessages(timestamp) {
    if (Date.now() - timestamp < FIVE_MINUTES) {
        var deferred = new promise.Deferred();
        deferred.resolve(null);
        return deferred.promise;
    }

    return getRequest('http://api.sr.se/api/v2/traffic/messages?size=1000&format=json', timestamp).then(function (data) {
        if (data) {
            data = data.messages
                .map(function(message) {
                    message.createddate = new Date(+message.createddate.slice(6, -7)).getTime();
                    return message;
                })
                .sort(function(a, b) {
                    return b.createddate - a.createddate;
                })
                .slice(0, 100);
        }

        return data;
    });
}

function getRequest(url, timestamp) {
    var deferred = new promise.Deferred();

    var options = {
        uri: url,
        json: true,
    };

    if (timestamp) {
        options['headers'] = {'If-Modified-Since': new Date(timestamp).toUTCString()};
    }

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            deferred.resolve(body);
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
