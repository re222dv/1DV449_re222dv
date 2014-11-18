/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      id: {
          type: 'int',
          primaryKey: true,
          autoIncrement: true
      },
      username: {
          type: 'string',
          unique: true,
          size: 30,
      },
      hash: 'string',
  }
};

