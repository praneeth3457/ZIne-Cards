
class headerController {
  Constructor($location, $scope, $rootScope) {
    console.log('hello');
    this.isActive = function(menu){
      console.log('hello');
		    var currentRoute = $location.path();
        return menu === currentRoute ? 'active' : '';
   }

   $rootScope.$on('login', function(event, args) {
     console.log(args);
   });

  }
}

export default headerController;
