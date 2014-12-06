'use strict';

import {getData, updateArea} from './sr';

export var routes = [
  {
    path: '/api/traffic',
    method: 'GET',
    handler: function (_, reply) {
      getData()
        .then(function (data) {
          reply(data);
        }, function (err) {
          throw err;
        });
    }
  },
  {
    path: '/api/area',
    method: 'POST',
    handler: function (req, reply) {
      updateArea(req.payload.name, req.payload.longitude, req.payload.latitude)
        .then(function () {
          reply('saved');
        }, function (err) {
          throw err;
        });
    }
  },
];
