var app = angular.module('zine-cards');
app.controller('statsController', function(statsService) {
  var stat = this;
  statsService.stats().then(function(res){
    if(res.data.message == 'Success') {
      stat.data = res.data.stats;

      //Order by average
      sortByKey(stat.data, 'avg');
      function sortByKey(array, key) {
        stat.avgData = array.sort(function(a,b) { return b[key] - a[key];});
      }
    }
  }, function(error) {

  });
});



// import statstemplate from './stats.html';
//
// export const stats = {
//   template: statstemplate,
//   controller (statsService) {
//     var stat = this;
//     statsService.stats().then(function(res){
//       console.log(res);
//       if(res.data.message == 'Success') {
//         stat.data = res.data.stats;
//       }
//     }, function(error) {
//
//     });
//   }
// };
