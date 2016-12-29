var app = angular.module('zine-cards');
app.controller('howToPlayCtrl', function($http) {
  $http.get('/test').then(function success(response) {
    console.log(response);
  }, function error(error) {
    console.log(error);
  });
});
