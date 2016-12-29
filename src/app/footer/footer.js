var app = angular.module('zine-cards');
app.controller('footerController', function($http) {
  this.isActive = function(menu){
    var currentRoute = $location.path();
    return menu === currentRoute ? 'active' : '';
  }
});

//
// import footerTemplate from './footer.html';
// 
// export const footer = {
//   template: footerTemplate,
//   controller ($location) {
//     this.isActive = function(menu){
// 	    var currentRoute = $location.path();
//       return menu === currentRoute ? 'active' : '';
//    }
//   }
// };
