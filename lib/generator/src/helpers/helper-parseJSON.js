(function() {
  module.exports.register = function(Handlebars, options) {

    // Customize this helper
    Handlebars.registerHelper('parseJSON', function(data, options) {
      return options.fn(JSON.parse(data));
    });

  };
}).call(this);
