var app = angular.module('zine-cards');
app.controller('headerController', function($location, $rootScope, $http, userService, pageFlowService) {
  var header = this;
  this.userService = userService;
  this.pageFlowService = pageFlowService;

  this.isActive = function(menu){
    var currentRoute = $location.path();
    return menu === currentRoute ? 'active' : '';
  }

 $rootScope.$on('login', function(event, args) {
   header.isLogin = args.isLogin;
 });

 $http.get('/dashboard').then(function(response) {
   if(angular.isDefined(response.data.user)) {
     header.isLogin = true;
     $rootScope.$broadcast('userData', {user : response.data.user});
     header.userService.setUser({isLogin : true, data : response.data.user});
     header.pageFlowService.setLogin(true);
     $rootScope.$broadcast('isLogin', true);
   } else {
     header.isLogin = false;
   }
 }, function(error) {
   header.isLogin = false;
 });

 this.logout = function() {
   $http.get('/logout').then(function(response) {
     if(angular.isDefined(response.data)) {
       if(response.data.message == 'Successfully logged out') {
         header.isLogin = false;
         header.pageFlowService.setLogin(false);
         $rootScope.$broadcast('isLogin', false);
         header.userService.setUser({isLogin : false, data : ''});
         $location.path('/login');
       }
     }
   });
 }

 header.isSettings = false;
 this.toggleSettings = function() {
   if(header.isSettings == true) {
     header.isSettings = false;
   } else {
     header.isSettings = true;
   }
 }
});



// import headerController from './headerController.js';
// import headerTemplate from './header.html';
//
// export const header = {
//   template: headerTemplate,
//   controller ($location, $rootScope, $http, userService, pageFlowService) {
//     var header = this;
//     this.userService = userService;
//     this.pageFlowService = pageFlowService;
//
//     this.isActive = function(menu){
// 	    var currentRoute = $location.path();
//       return menu === currentRoute ? 'active' : '';
//     }
//
//    $rootScope.$on('login', function(event, args) {
//      header.isLogin = args.isLogin;
//    });
//
//    $http.get('/dashboard').then(function(response) {
//      if(angular.isDefined(response.data.user)) {
//        header.isLogin = true;
//        $rootScope.$broadcast('userData', {user : response.data.user});
//        header.userService.setUser({isLogin : true, data : response.data.user});
//        header.pageFlowService.setLogin(true);
//        $rootScope.$broadcast('isLogin', true);
//      } else {
//        header.isLogin = false;
//      }
//    }, function(error) {
//      header.isLogin = false;
//    });
//
//    this.logout = function() {
//      $http.get('/logout').then(function(response) {
//        if(angular.isDefined(response.data)) {
//          if(response.data.message == 'Successfully logged out') {
//            header.isLogin = false;
//            header.pageFlowService.setLogin(false);
//            $rootScope.$broadcast('isLogin', false);
//            $location.path('/login');
//          }
//        }
//      });
//    }
//
//    header.isSettings = false;
//    this.toggleSettings = function() {
//      if(header.isSettings == true) {
//        header.isSettings = false;
//      } else {
//        header.isSettings = true;
//      }
//    }
//
//   }
// };
