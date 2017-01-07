var app = angular.module('zine-cards', ['ui.router', 'ngSanitize']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  	function($stateProvider, $urlRouterProvider, $locationProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('main', {
          url: '/',
          templateUrl : './src/app/main/main.html'
        })
        .state('stats', {
          url: '/stats',
          templateUrl : './src/app/stats/stats.html'
        })
        .state('howToPlay', {
          url: '/how-to-play',
          templateUrl : './src/app/howToPlay/howToPlay.html'
        })
        .state('login', {
          url: '/login',
          templateUrl : './src/app/log-in/login.html',
          resolve: {
            check: function(pageFlowService, $location, $rootScope) {
              if(pageFlowService.getLogin() == true) {
                $location.path('/');
              }
              $rootScope.$on('isLogin', function(event, args) {
                if(args == true) {
                  $location.path('/');
                }
              });
            }
          }
        })
        .state('profile', {
          url: '/profile',
          templateUrl : './src/app/profile/profile.html',
          resolve: {
            check: function(pageFlowService, $location, $rootScope) {
              console.log(pageFlowService.getLogin());
              if(pageFlowService.getLogin() == false) {
                $location.path('/');
              }
              $rootScope.$on('isLogin', function(event, args) {
                if(args == false) {
                  $location.path('/');
                }
              });
            }
          }
        });

        $locationProvider.html5Mode(true).hashPrefix('!');
    }
  ]);
