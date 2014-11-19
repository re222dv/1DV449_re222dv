/**
* Messages.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      alias: {
          type: 'string',
          size: 30,
      },
      text: {
          type: 'string',
      },
      user: {
          model: 'user',
      }
  }
};

