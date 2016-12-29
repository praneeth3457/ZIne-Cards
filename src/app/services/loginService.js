var app = angular.module('zine-cards');
app.service('loginService', function($http) {
  this.register = function(request) {
    return $http.post('/register', request);
  }

  this.login = function(request) {
    return $http.post('/login', request);
  }

  this.logout = function(request) {
    return $http.post('/login', request);
  }
});
