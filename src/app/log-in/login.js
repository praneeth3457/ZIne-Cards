var app = angular.module('zine-cards');
app.controller('loginController', function($http, loginService, $location, $scope, $rootScope, userService, pageFlowService) {
  var signin = this;

  signin.gender = 'male';
  this.loginName = 'login';
  this.login = function(value) {
    if(value == 'login') {
      signin.loginName = 'login';
    } else {
      signin.loginName = 'register';
    }
  }


  //Error validation for register fields
  //Name Validation
  this.checkName = function (name) {
    var regex = new RegExp("^[a-zA-Z ]+$");
    if(name !== undefined && name !== '') {
      var len = name.split('').length;
      if(len >= 3 && regex.test(name)) {
        this.isNameError = false;
        this.nameError = '';
      } else {
        this.isNameError = true;
        this.nameError = 'Name should only contain alphabets and white spaces!';
      }
    } else {
      this.isNameError = true;
      this.nameError = 'Name should only contain alphabets and white spaces!';
    }
  }

  //Username Validation
  this.checkUsername = function (username) {
    var regex = new RegExp("^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$");
    if(username !== undefined && username !== '') {
      var len = username.split('').length;
      if(len >= 3 && regex.test(username)) {
        this.isUsernameError = false;
        this.usernameError = '';
      } else {
        this.isUsernameError = true;
        this.usernameError = 'Username should be min 3 alphanumeric characters!';
      }
    } else {
      this.isUsernameError = true;
      this.usernameError = 'Username should be min 3 alphanumeric characters!';
    }
  }

  //Password Validation
  this.checkPassword = function (password) {
    //var regex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]!@#\$%\^\&*\+)$");
    if(password !== undefined && password !== '') {
      var len = password.split('').length;
      if(len >= 6) {
        this.isPasswordError = false;
        this.passwordError = '';
      } else {
        this.isPasswordError = true;
        this.passwordError = 'Password should be min of 6 characters length!';
      }
    } else {
      this.isPasswordError = true;
      this.passwordError = 'Password should be min of 6 characters length!';
    }
  }

  //Confirm Password Validation
  this.checkCPassword = function (cpassword, password) {
    //var regex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]!@#\$%\^\&*\+)$");
    if(cpassword !== undefined && cpassword !== '' && cpassword === password) {
      this.isCPasswordError = false;
      this.cpasswordError = '';
    } else {
      this.isCPasswordError = true;
      this.cpasswordError = 'Confirm password should match with password!';
    }
  }

  // registering User
  this.register = function () {

    if(!signin.isNameError && !signin.isUsernameError && !signin.isPasswordError && !signin.isCPasswordError) {
      signin.registerSpinner = true;
      signin.registerInlineError = false;
      var avatar = signin.gender + '1'
      var registerRequest = {
        name : signin.registerName,
        gender : signin.gender,
        avatar : avatar,
        username : signin.registerUsername,
        email : signin.registerEmail,
        password : signin.registerPassword,
      }
      loginService.register(registerRequest).then(function(response) {
        signin.registerSpinner = false;
        if(response.data.message == 'Success') {
          signin.isRegister = true;
          signin.registerMsg = 'Successfully registered!';
          signin.registerSubmitError = false;
          signin.registerUnsuccessMsg = '';
          //fields empty
          signin.registerName = '';
          signin.registerUsername = '';
          signin.registerEmail = '';
          signin.registerPassword = '';
          signin.registerCPassword = '';
          signin.isNameError = '';
          signin.isUsernameError = '';
          signin.isPasswordError = '';
          signin.isCPasswordError = '';
        } else {
          signin.registerSubmitError = 'unsuccess';
          if(response.data.error.errmsg.includes("username")) {
            signin.registerUnsuccessMsg = 'Username already exists!';
          } else {
            signin.registerUnsuccessMsg = 'Email id already exists!';
          }
        }

      }, function(error) {
        signin.registerSpinner = false;
        signin.registerSubmitError = 'error';

        //fields empty
        signin.registerName = '';
        signin.registerUsername = '';
        signin.registerEmail = '';
        signin.registerPassword = '';
        signin.registerCPassword = '';
        signin.isNameError = '';
        signin.isUsernameError = '';
        signin.isPasswordError = '';
        signin.isCPasswordError = '';
      })
    } else {
      signin.registerInlineError = true;
    }

  }

  //Login User
  this.loginSubmit = function () {
    var loginRequest = {
      username : signin.loginUsername,
      password : signin.loginPassword
    }
    loginService.login(loginRequest).then(function(response) {
      if(response.data.message == 'Success') {
        signin.loginError = false;
        $rootScope.$emit('login', {isLogin : true, data : response.data});
        userService.setUser({isLogin : true, data : response.data.user});
        pageFlowService.setLogin(true);
        $location.path('/');
      } else {
        signin.loginError = 'Username and/or Password is incorrect!';
      }
    }, function(error) {
      signin.loginError = 'Service unavailable. Please try again later!';
    })
  }
});





// import loginController from './loginController.js';
// import loginTemplate from './login.html';
//
//   export const login = {
//     template: loginTemplate,
//     controller($http, loginService, $location, $scope, $rootScope, userService, pageFlowService) {
//       var signin = this;
//
//       signin.gender = 'male';
//       this.loginName = 'login';
//       this.login = function(value) {
//         if(value == 'login') {
//           signin.loginName = 'login';
//         } else {
//           signin.loginName = 'register';
//         }
//       }
//
//
//       //Error validation for register fields
//       //Name Validation
//       this.checkName = function (name) {
//         var regex = new RegExp("^[a-zA-Z ]+$");
//         if(name !== undefined && name !== '') {
//           var len = name.split('').length;
//           if(len >= 3 && regex.test(name)) {
//             this.isNameError = false;
//             this.nameError = '';
//           } else {
//             this.isNameError = true;
//             this.nameError = 'Name should only contain alphabets and white spaces!';
//           }
//         } else {
//           this.isNameError = true;
//           this.nameError = 'Name should only contain alphabets and white spaces!';
//         }
//       }
//
//       //Username Validation
//       this.checkUsername = function (username) {
//         var regex = new RegExp("^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$");
//         if(username !== undefined && username !== '') {
//           var len = username.split('').length;
//           if(len >= 3 && regex.test(username)) {
//             this.isUsernameError = false;
//             this.usernameError = '';
//           } else {
//             this.isUsernameError = true;
//             this.usernameError = 'Username should be min 3 alphanumeric characters!';
//           }
//         } else {
//           this.isUsernameError = true;
//           this.usernameError = 'Username should be min 3 alphanumeric characters!';
//         }
//       }
//
//       //Password Validation
//       this.checkPassword = function (password) {
//         //var regex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]!@#\$%\^\&*\+)$");
//         if(password !== undefined && password !== '') {
//           var len = password.split('').length;
//           if(len >= 6) {
//             this.isPasswordError = false;
//             this.passwordError = '';
//           } else {
//             this.isPasswordError = true;
//             this.passwordError = 'Password should be min of 6 characters length!';
//           }
//         } else {
//           this.isPasswordError = true;
//           this.passwordError = 'Password should be min of 6 characters length!';
//         }
//       }
//
//       //Confirm Password Validation
//       this.checkCPassword = function (cpassword, password) {
//         //var regex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]!@#\$%\^\&*\+)$");
//         if(cpassword !== undefined && cpassword !== '' && cpassword === password) {
//           this.isCPasswordError = false;
//           this.cpasswordError = '';
//         } else {
//           this.isCPasswordError = true;
//           this.cpasswordError = 'Confirm password should match with password!';
//         }
//       }
//
//       // registering User
//       this.register = function () {
//
//         if(!signin.isNameError && !signin.isUsernameError && !signin.isPasswordError && !signin.isCPasswordError) {
//           signin.registerSpinner = true;
//           signin.registerInlineError = false;
//           var avatar = signin.gender + '1'
//           var registerRequest = {
//             name : signin.registerName,
//             gender : signin.gender,
//             avatar : avatar,
//             username : signin.registerUsername,
//             email : signin.registerEmail,
//             password : signin.registerPassword,
//           }
//           loginService.register(registerRequest).then(function(response) {
//             signin.registerSpinner = false;
//             if(response.data.message == 'Success') {
//               signin.isRegister = true;
//               signin.registerMsg = 'Successfully registered!';
//               signin.registerSubmitError = false;
//               signin.registerUnsuccessMsg = '';
//               //fields empty
//               signin.registerName = '';
//               signin.registerUsername = '';
//               signin.registerEmail = '';
//               signin.registerPassword = '';
//               signin.registerCPassword = '';
//               signin.isNameError = '';
//               signin.isUsernameError = '';
//               signin.isPasswordError = '';
//               signin.isCPasswordError = '';
//             } else {
//               signin.registerSubmitError = 'unsuccess';
//               if(response.data.error.errmsg.includes("username")) {
//                 signin.registerUnsuccessMsg = 'Username already exists!';
//               } else {
//                 signin.registerUnsuccessMsg = 'Email id already exists!';
//               }
//             }
//
//           }, function(error) {
//             signin.registerSpinner = false;
//             signin.registerSubmitError = 'error';
//
//             //fields empty
//             signin.registerName = '';
//             signin.registerUsername = '';
//             signin.registerEmail = '';
//             signin.registerPassword = '';
//             signin.registerCPassword = '';
//             signin.isNameError = '';
//             signin.isUsernameError = '';
//             signin.isPasswordError = '';
//             signin.isCPasswordError = '';
//           })
//         } else {
//           signin.registerInlineError = true;
//         }
//
//       }
//
//       //Login User
//       this.loginSubmit = function () {
//         var loginRequest = {
//           username : signin.loginUsername,
//           password : signin.loginPassword
//         }
//         loginService.login(loginRequest).then(function(response) {
//           if(response.data.message == 'Success') {
//             signin.loginError = false;
//             $rootScope.$emit('login', {isLogin : true, data : response.data});
//             userService.setUser({isLogin : true, data : response.data.user});
//             pageFlowService.setLogin(true);
//             $location.path('/');
//           } else {
//             signin.loginError = 'Username and/or Password is incorrect!';
//           }
//         }, function(error) {
//           signin.loginError = 'Service unavailable. Please try again later!';
//         })
//       }
//   }
// };
