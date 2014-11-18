var bcrypt = require('bcryptjs');

module.exports = {

    hash: function(password) {
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    },

    verify: function(password, hash) {
        return bcrypt.compareSync(password, hash);
    },
};
