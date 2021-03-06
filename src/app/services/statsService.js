var app = angular.module('zine-cards');
app.service('statsService', function($http) {
  this.stats = function() {
    return $http.get('/stats');
  }
  this.updateStats = function(data) {
    return $http.post('/updateStats', data);
  }
});
