'use strict';

import {getData, updateArea} from './sr';

export var routes = [
  {
    path: '/api/traffic',
    method: 'GET',
    handler: (_, reply) => getData().then(reply),
  },
  {
    path: '/api/area',
    method: 'POST',
    handler: (request, reply) =>
      updateArea(request.payload.name, request.payload.longitude, request.payload.latitude)
        .then(() => reply('saved')),
  },
];
