var app = angular.module('zine-cards');
app.service('userService', function($http) {
  this.user = {isLogin : false, data : ''};
  this.setUser = function(data) {
    this.user = data;
    return this.user;
  }

  this.getUser = function() {
    return this.user;
  }
});
