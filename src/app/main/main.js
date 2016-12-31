var app = angular.module('zine-cards');
app.controller('mainController', function($http, userService, $location, $scope, $interval, $timeout, statsService, $window, $rootScope) {
  var main = this;
  this.isGame = false;
  main.timeToStart = 90;
  main.startGameTimer = false;
  var socket = io.connect();

  //When user clicks on 'PLAY GAME'
  this.playGame = function() {
    var checkLogin = userService.getUser();
    if(checkLogin.isLogin) {
      this.isGame = true;
      socket.emit('set game user', {user: checkLogin.data});
    } else {
      $location.path('/login');
    }
  }

  // When user place a show
  main.placeShow = function() {
    var placedUser = userService.getUser();
    socket.emit('place show', {user: placedUser.data.username, gameDetails: main.gameDetails});
  }


  /*
  ******** ALL THE WEB SOCKETS **********
  */

  // Registering the user in the game
  socket.on('get game user', function(gameUsers){
    var storeUser;
    var mainUser = userService.getUser();
    //This is used to add the profile user to be at the bottom of the page, in the game
    for(var m=0; m<gameUsers.users.length; m++){
      if(mainUser.data.username == gameUsers.users[m].username) {
        storeUser = gameUsers.users.splice(m, 1);
        gameUsers.users.unshift(storeUser[0]);
      }
    }
    main.gameDetails = gameUsers;
    if(main.gameDetails.users.length >= 2) {
      main.startGameTimer = true;
    }
    $scope.$apply();
  });

  // Timer for the game will start
  socket.on('get start timer', function(time){
    main.timeToStart = time;
    $scope.$apply();
  });

  //For starting the game, If started place a show & timer will start.
  socket.on('get start game', function(status){
    main.isGameStart = status;
    $scope.$apply();
  });

  //For getting the timer of the game to place a show.
  socket.on('get game round time', function(time){
    main.isGameRoundTimer = true;
    main.gameRoundTimer = time;
    $scope.$apply();
  });

  //For getting the game cards.
  socket.on('get game cards', function(gameDetails){
    main.cardsTotal = 0;
    main.maxTotal = 0;
    var storeUser;
    var mainUser = userService.getUser();
    for(var m=0; m<gameDetails.users.length; m++){
      if(mainUser.data.username == gameDetails.users[m].username) {
        storeUser = gameDetails.users.splice(m, 1);
        gameDetails.users.unshift(storeUser[0]);
      }
    }
    main.gameDetails = gameDetails;
    var checkLogin = userService.getUser();
    for(var i=0; i<gameDetails.users.length; i++) {
      if(gameDetails.users[i].username == checkLogin.data.username){
        main.cards = gameDetails.users[i].presentCards;
        console.log(main.cards);
        // if(main.cards.length >= 5) {
        //   $timeout(function () {
        //     socket.emit('place show', {user: 'Zine auto-show', gameDetails: main.gameDetails});
        //   }, 5000);
        // }
        for(var t=0; t<main.cards.length; t++) {
          main.cardsTotal += main.cards[t];
          main.maxTotal += 9;
        }
        var totalRound = Math.round(main.cardsTotal/gameDetails.users[i].presentCards.length);
        switch (totalRound) {
          case 0:
              main.suggest = "very bad";
              break;
          case 1:
              main.suggest = "very bad";
              break;
          case 2:
              main.suggest = "bad";
              break;
          case 3:
              main.suggest = "bad";
              break;
          case 4:
              main.suggest = "average";
              break;
          case 5:
              main.suggest = "average";
              break;
          case 6:
              main.suggest = "good";
              break;
          case 7:
              main.suggest = "very good";
              break;
          case 8:
              main.suggest = "excellent";
              break;
          case 9:
              main.suggest = "excellent";
              break;
      }

      }

    }
    $scope.$apply();
  });

  //Name of the show placed user.
  socket.on('get placed user', function(data){
    console.log(data);
    main.newGameStart = false;
    main.showOtherUserCards = true;
    main.placedMessage = 'Please wait! ' + data.user + ' has placed the show!';
    main.isPlacedMessage = true;
    main.isGameRoundTimer = false;
    $scope.$apply();
    var storeUser;
    var mainUser = userService.getUser();
    for(var m=0; m<data.gameDetails.users.length; m++){
      if(mainUser.data.username == data.gameDetails.users[m].username) {
        storeUser = data.gameDetails.users.splice(m, 1);
        data.gameDetails.users.unshift(storeUser[0]);
      }
    }
    main.gameDetails = data.gameDetails;


    $scope.$apply();
  });

  //For getting the new data, after that particular game is finished also will give previous game winner.
  socket.on('new data', function(data){
    var storeUser;
    var mainUser = userService.getUser();
    for(var m=0; m<data.users.length; m++){
      if(mainUser.data.username == data.users[m].username) {
        storeUser = data.users.splice(m, 1);
        data.users.unshift(storeUser[0]);
      }
    }
    main.gameDetails = data;

    main.isGameRoundTimer = false;
    $timeout(function () {
      main.showOtherUserCards = false;
      main.newGameStart = true;
    }, 14000);
    var time = 15;
    main.startGameTimer = true;
    main.isGameStart = false;
    var setTimeInterval = setInterval(function () {
       main.timeToStart = time;
       time --;
       if(time == 0){
         clearInterval(setTimeInterval);
         main.startGameTimer = false;
         main.isPlacedMessage = false;
         main.isGameStart = true;
       }
       $scope.$apply();
    }, 1000);

    // main.isPlacedMessage = false;
    $scope.$apply();
  });

  //If any winner, this will broadcast the winner after getting 250 points.
  socket.on('game winner', function(data){
    var checkWinnerUser = userService.getUser();
    main.gameOver = true;
    if(checkWinnerUser.data.username == data.winner.username) {
      main.isWinner = true;
      $window.alert('Congratulations! You won the game.');
    } else {
      main.isWinner = false;
      $window.alert('Oops! You lost the game.');
    }
    $timeout(function () {
      $location.path('/stats');
    }, 2000);
    statsService.updateStats(data.data.gameDetails.users).then(function(res) {
      $http.get('/dashboard').then(function(response) {
        //$rootScope.$broadcast('userData', {user : response.data.user});
        $rootScope.$emit('login', {isLogin : true, data : response.data});
      });
    }, function(err) {

    });
    $scope.$apply();
  });

  /*
  ******* END OF WEB SOCKETS ************
  */
});
