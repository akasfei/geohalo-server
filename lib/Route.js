function Route(method, url, callback) {
  if (arguments.length > 2)
    this.method = method;
  this.url = url;
  this.callback = callback;
  return this;
}

Route.prototype.method = 'GET';

Route.prototype.register = function (app) {
  if (this.method === 'GET')
    return app.get(this.url, this.callback);
  else if (this.method === 'POST')
    return app.post(this.url, this.callback);
}

module.exports = Route;