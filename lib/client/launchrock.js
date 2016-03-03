(function() {
  'use strict';

  var request = require('request-promise').defaults({jar: true});

  var bunyan = require('bunyan');
  var defaults = require('./defaults');

  var LOGGER     = bunyan.createLogger({name: 'Launchchimp.Launchrock'});
  var AUTH_URL   = 'https://www.launchrock.com/auth/login';
  var EXPORT_URL = 'https://www.launchrock.com/api/site-manager/sites/$PROJECT_ID$/users/export';

  var authenticate = function (email, password) {
    LOGGER.info('LOGGING IN: ' + email);
    return request
      .post(AUTH_URL, {
        form: {
          email: email,
          password: password
        },
        headers: defaults.headers,
        resolveWithFullResponse: true,
        simple: false
      }).then(function (response) {
        var hash;
        if (response.statusCode === 302 &&
            response.headers.location == "https://www.launchrock.com/account") {
          LOGGER.info('LOGGED IN.');
          return true;
        } else {
          LOGGER.info('Failed login response: ' + JSON.stringify(response));
          throw new Error('Failed to login with email and password');
        }
      });
  };

  var fetchUsers = function (projectId) {
    var url = EXPORT_URL.replace('$PROJECT_ID$', projectId);
    LOGGER.info('EXPORTING CSV: ' + url);
    return request.get(url, {
      headers: defaults.headers
    });
  };

  module.exports = {
    fetchUsers: function (lrOpts) {
      return authenticate(lrOpts.email, lrOpts.password)
        .then(function () {
          return fetchUsers(lrOpts.projectId);
        });
    }
  };

})();
