var app = angular.module('zine-cards');
app.controller('subHeaderController', function($rootScope, statsService) {
  var sub = this;
  $rootScope.$on('login', function(event, args) {
    sub.isLogin = args.isLogin;
    sub.name = args.data.user.name;
    sub.username = args.data.user.username;
    if(args.isLogin == true) {
      getStats();
    }
  });
  $rootScope.$on('isLogin', function(event, args) {
    sub.isLogin = args;
    if(args == true) {
      getStats();
    }
  });
  $rootScope.$on('userData', function(event, args) {
    sub.name = args.user.name;
    sub.username = args.user.username;
  });

  function getStats() {
    statsService.stats().then(function(res) {
      if(res.data.message == 'Success') {
        if(angular.isDefined(res.data.stats)){
          for(var i=0; i<res.data.stats.length; i++) {
            if(sub.username == res.data.stats[i].username) {
              sub.level = res.data.stats[i].level;
              sub.rank = res.data.stats[i].rank;
              sub.stars = res.data.stats[i].stars;
            }
          }
        }
      }
    }, function(err) {
      console.log(err);
    });
  }
});



// import subheadertemplate from './subHeader.html';
//
// export const subheader = {
//   template: subheadertemplate,
//   controller ($rootScope, statsService) {
//     var sub = this;
//     $rootScope.$on('login', function(event, args) {
//       sub.isLogin = args.isLogin;
//       sub.name = args.data.user.name;
//       sub.username = args.data.user.username;
//       if(args.isLogin == true) {
//         getStats();
//       }
//     });
//     $rootScope.$on('isLogin', function(event, args) {
//       sub.isLogin = args;
//       if(args == true) {
//         getStats();
//       }
//     });
//     $rootScope.$on('userData', function(event, args) {
//       sub.name = args.user.name;
//       sub.username = args.user.username;
//     });
//
//     function getStats() {
//       statsService.stats().then(function(res) {
//         if(res.data.message == 'Success') {
//           if(angular.isDefined(res.data.stats)){
//             for(var i=0; i<res.data.stats.length; i++) {
//               if(sub.username == res.data.stats[i].username) {
//                 sub.level = res.data.stats[i].level;
//                 sub.rank = res.data.stats[i].rank;
//                 sub.stars = res.data.stats[i].stars;
//               }
//             }
//           }
//         }
//       }, function(err) {
//         console.log(err);
//       });
//     }
//
//   }
// };
