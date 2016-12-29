export default routesConfig;

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      url: '/',
      component: 'main'
    })
    .state('stats', {
      url: '/stats',
      component: 'stats'
    })
    .state('howToPlay', {
      url: '/how-to-play',
      component: 'howToPlay'
    })
    .state('login', {
      url: '/login',
      component: 'login',
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
      component: 'profile',
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
}
