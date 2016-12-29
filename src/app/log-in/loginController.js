
class loginController {
  Constructor($http) {

    var signin = this;

    this.loginName = 'login';
    this.login = function(value) {
      if(value == 'login') {
        signin.loginName = 'login';
      } else {
        signin.loginName = 'register';
      }
    }

  }
}

export default loginController;
