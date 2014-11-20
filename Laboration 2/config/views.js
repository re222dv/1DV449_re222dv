/**
 * View Engine Configuration
 * (sails.config.views)
 *
 * Server-sent views are a classic and effective way to get your app up
 * and running. Views are normally served from controllers.  Below, you can
 * configure your templating language/framework of choice and configure
 * Sails' layout support.
 *
 * For more information on views and layouts, check out:
 * http://sailsjs.org/#/documentation/concepts/Views
 */

/**
 * Minifying code from https://github.com/balderdashy/sails/issues/2188#issuecomment-56994236
 */
var minify = require('html-minifier').minify;
var ejs = require('ejs-locals');
var parsing = function(path,options,fn) {
    options.locals = options.locals || {};
    options.locals._layoutFile = 'layout.ejs';
    ejs(path, options, function(err, str){
        str = minify(str,{collapseWhitespace: true, removeComments: true});
        return fn(err, str);
    });
};

module.exports.views = {
    engine: {
        ext: 'ejs',
        fn: parsing
    },
    layout: false
};
