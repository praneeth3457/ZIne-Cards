var app = angular.module('zine-cards');
app.service('pageFlowService', function($http) {
  this.isLogin = false;

  this.setLogin = function (isLogin) {
    this.isLogin = isLogin;
  }
  this.getLogin = function () {
    return this.isLogin;
  }
});
