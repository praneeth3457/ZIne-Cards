var app = angular.module('zine-cards');
app.service('profileService', function($http) {
  this.isLogin = false;

  this.update = function(request) {
    return $http.post('/profile', request);
  }
});
