'use strict';

let fs = require('promised-io/fs');
let promise = require('promised-io/promise');
let request = require('request');

const BASE = 'http://api.sr.se/api/v2/traffic';

const FIVE_MINUTES = 1000 * 60 * 5;
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 30 * 6;

function getRequest(url, timestamp) {
  let deferred = new promise.Deferred();

  let options = {
    uri: url,
    json: true,
  };

  if (timestamp) {
    options.headers = {'If-Modified-Since': new Date(timestamp).toUTCString()};
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      deferred.resolve(body);
    } else if (!error && response.statusCode === 304) {
      deferred.resolve(null);
    } else {
      deferred.reject(error);
    }
  });

  return deferred.promise;
}

function getAreas(timestamp) {
  if (Date.now() - timestamp < SIX_MONTHS) {
    let deferred = new promise.Deferred();
    deferred.resolve(null);
    return deferred.promise;
  }

  return getRequest(BASE + '/areas?size=100&format=json', timestamp).then(data => data.areas);
}

function getTrafficMessages(timestamp) {
  if (Date.now() - timestamp < FIVE_MINUTES) {
    let deferred = new promise.Deferred();
    deferred.resolve(null);
    return deferred.promise;
  }

  return getRequest(`${BASE}/messages?size=1000&format=json`, timestamp).then(data => {
    if (data) {
      data = data.messages
        .map(message => {
          message.createddate = new Date(+message.createddate.slice(6, -7)).getTime();
          return message;
        })
        .sort((a, b) => b.createddate - a.createddate)
        .slice(0, 100);
    }

    return data;
  });
}

function cacheData(areas, messages) {
  let data = {areas: areas, messages: messages, timestamp: Date.now()};

  return fs.writeFile('cache', JSON.stringify(data))
    .then(() => data, () => {
      console.log('caching failed');
      return data;
    });
}

export function getData() {
  return fs.readFile('cache')
    .then(content => {
      let cachedData = JSON.parse(content);

      return promise.all([
        getAreas(cachedData.timestamp),
        getTrafficMessages(cachedData.timestamp),
      ])
      .then(data => {
        if (data[0] === null) data[0] = cachedData.areas;
        if (data[1] === null) data[1] = cachedData.messages;

        return cacheData(data[0], data[1]);
      });
    },
    () => promise.all([
        getAreas(),
        getTrafficMessages(),
      ])
      .then(data => cacheData(data[0], data[1]))
    );
}

export function updateArea(name, longitude, latitude) {
  if (isNaN(longitude) || isNaN(latitude)) {
    let deferred = new promise.Deferred();
    deferred.resolve(null);
    return deferred.promise;
  }

  return fs.readFile('cache')
    .then(content => {
      let cachedData = JSON.parse(content);

      cachedData.areas
        .filter(area => area.name === name)
        .map(area => {
          if (area.longitude !== undefined && area.longitude !== undefined) return area;

          area.longitude = longitude;
          area.latitude = latitude;
          return area;
        });

      return fs.writeFile('cache', JSON.stringify(cachedData));
    });
}
