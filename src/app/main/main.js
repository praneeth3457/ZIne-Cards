var app = angular.module('zine-cards');
app.controller('mainController', function($http, userService, $location, $scope, $interval) {
  var main = this;
  this.isGame = false;
  main.timeToStart = 90;
  main.startGameTimer = false;

  this.playGame = function() {
    var socket = io.connect();
    var checkLogin = userService.getUser();
    if(checkLogin.isLogin) {
      this.isGame = true;
      socket.emit('set game user', {user: checkLogin.data});
    } else {
      $location.path('/login');
    }

    socket.on('get game user', function(gameUsers){
      main.gameDetails = gameUsers;
      console.log(main.gameDetails.users.length);
      if(main.gameDetails.users.length >= 2) {
        main.startGameTimer = true;
      }
      $scope.$apply();
    });

    socket.on('get start timer', function(time){
      main.timeToStart = time;
      $scope.$apply();
    });


  }
});




// import mainController from './mainController.js';
// import mainTemplate from './main.html';
//
// export const main = {
//   template: mainTemplate,
//   controller: mainController
// };
