var app = angular.module('zine-cards');
app.controller('profileController', function($http, $rootScope, userService, profileService) {
  var profile = this;
  var maleAvatar = ['male1', 'male2', 'male3', 'male4', 'male5'];
  var femaleAvatar = ['female1', 'female2', 'female3', 'female4', 'female5'];
  this.isChangeAvatar = false;
  var user = userService.getUser();
  this.user = user.data;
  $rootScope.$on('userData', function(event, args){
    profile.user = args.user;
    profile.avatar = '<img src="./src/app/images/avatar-' + profile.user.gender + '/' + profile.user.avatar + '.png"></img>';
  });
  if(this.user) {
    this.avatar = '<img src="./src/app/images/avatar-' + this.user.gender + '/' + this.user.avatar + '.png"></img>';
  }

  this.changeAvatar = function () {
    profile.avatarArray = [];
    profile.isChangeAvatar = true;
    if(profile.user.gender == 'male') {
      for(var i=0; i<maleAvatar.length; i++) {
        var avatarName = maleAvatar[i];
        var newAvatar = '<img src="./src/app/images/avatar-' + profile.user.gender + '/' + maleAvatar[i] + '.png"></img>';
        profile.avatarArray.push({avatarLink : newAvatar, avatarName : avatarName});
      }
    } else if(profile.user.gender == 'female') {
      for(var j=0; j<femaleAvatar.length; j++) {
        var avatarName = femaleAvatar[j];
        var newAvatar = '<img src="./src/app/images/avatar-' + profile.user.gender + '/' + femaleAvatar[j] + '.png"></img>';
        profile.avatarArray.push({avatarLink : newAvatar, avatarName : avatarName});
        console.log(profile.avatarArray);
      }
    }
  }

  this.newAvatarSelected = function(avatar) {
    profile.user.avatar = avatar;
    profile.avatar = '<img src="./src/app/images/avatar-' + profile.user.gender + '/' + profile.user.avatar + '.png"></img>';
    profile.isChangeAvatar = false;


    profile.editName = profile.user.name;
    profile.editGender = profile.user.gender;
    profile.editUsername = profile.user.username;
    profile.editEmail = profile.user.email;
    profile.saveProfile();
  }

  this.isEdit = false;
  this.editProfile = function () {
    this.isEdit = true;
  }

  this.cancelProfile = function () {
    this.isEdit = false;
    profile.isError = false;
  }

  this.saveProfile = function () {
    this.isError = false;
    var saveRequest = {
      _id : profile.user._id,
      name : profile.editName,
      gender : profile.editGender,
      avatar : profile.user.avatar,
      username : profile.editUsername,
      email : profile.editEmail,
      password : profile.user.password
    }
    this.isEdit = false;
    profileService.update(saveRequest).then(function(response){
      if(response.data.message == 'Success') {
        profile.isError = false;
        profile.user = saveRequest;
      } else {
        profile.isError = true;
        profile.errorMsg = 'Unable to update at this time. Please try again later!';
      }
    }, function(error){
      profile.isError = true;
      profile.errorMsg = 'Service unavailable. Please try again later!';
    });
  }

  this.editPassword = false;
  this.changePassword = function() {
    this.editPassword = true;
  }

  this.cancelPassword = function() {
    this.editPassword = false;
    this.isPasswordError = false;
  }

  this.savePassword = function() {
    this.isPasswordError = false;
    if(profile.oldPassword == profile.user.password) {
      if(profile.newPassword == profile.verifyPassword) {
        profile.editName = profile.user.name;
        profile.editGender = profile.user.gender;
        profile.editUsername = profile.user.username;
        profile.editEmail = profile.user.email;
        profile.user.password = profile.newPassword;
        profile.saveProfile();
        this.editPassword = false;
      } else {
        profile.isPasswordError = true;
        profile.passwordError = 'New password should match with Verify password!';
      }
    } else {
      profile.isPasswordError = true;
      profile.passwordError = 'Your old password is wrong!';
    }
  }
});





// import profileTemplate from './profile.html';
//
// export const profile = {
//   template: profileTemplate,
//   controller($http, $rootScope, userService, profileService) {
//     var profile = this;
//     var maleAvatar = ['male1', 'male2', 'male3', 'male4', 'male5'];
//     var femaleAvatar = ['female1', 'female2', 'female3', 'female4', 'female5'];
//     this.isChangeAvatar = false;
//     var user = userService.getUser();
//     this.user = user.data;
//     $rootScope.$on('userData', function(event, args){
//       profile.user = args.user;
//       profile.avatar = '<img src="./app/images/avatar-' + profile.user.gender + '/' + profile.user.avatar + '.png"></img>';
//     });
//     if(this.user) {
//       this.avatar = '<img src="./app/images/avatar-' + this.user.gender + '/' + this.user.avatar + '.png"></img>';
//     }
//
//     this.changeAvatar = function () {
//       profile.avatarArray = [];
//       profile.isChangeAvatar = true;
//       if(profile.user.gender == 'male') {
//         for(var i=0; i<maleAvatar.length; i++) {
//           var avatarName = maleAvatar[i];
//           var newAvatar = '<img src="./app/images/avatar-' + profile.user.gender + '/' + maleAvatar[i] + '.png"></img>';
//           profile.avatarArray.push({avatarLink : newAvatar, avatarName : avatarName});
//         }
//       } else if(profile.user.gender == 'female') {
//         for(var j=0; j<femaleAvatar.length; j++) {
//           var avatarName = femaleAvatar[j];
//           var newAvatar = '<img src="./app/images/avatar-' + profile.user.gender + '/' + femaleAvatar[j] + '.png"></img>';
//           profile.avatarArray.push({avatarLink : newAvatar, avatarName : avatarName});
//           console.log(profile.avatarArray);
//         }
//       }
//     }
//
//     this.newAvatarSelected = function(avatar) {
//       profile.user.avatar = avatar;
//       profile.avatar = '<img src="./app/images/avatar-' + profile.user.gender + '/' + profile.user.avatar + '.png"></img>';
//       profile.isChangeAvatar = false;
//
//
//       profile.editName = profile.user.name;
//       profile.editGender = profile.user.gender;
//       profile.editUsername = profile.user.username;
//       profile.editEmail = profile.user.email;
//       profile.saveProfile();
//     }
//
//     this.isEdit = false;
//     this.editProfile = function () {
//       this.isEdit = true;
//     }
//
//     this.cancelProfile = function () {
//       this.isEdit = false;
//       profile.isError = false;
//     }
//
//     this.saveProfile = function () {
//       this.isError = false;
//       var saveRequest = {
//         _id : profile.user._id,
//         name : profile.editName,
//         gender : profile.editGender,
//         avatar : profile.user.avatar,
//         username : profile.editUsername,
//         email : profile.editEmail,
//         password : profile.user.password
//       }
//       this.isEdit = false;
//       profileService.update(saveRequest).then(function(response){
//         if(response.data.message == 'Success') {
//           profile.isError = false;
//           profile.user = saveRequest;
//         } else {
//           profile.isError = true;
//           profile.errorMsg = 'Unable to update at this time. Please try again later!';
//         }
//       }, function(error){
//         profile.isError = true;
//         profile.errorMsg = 'Service unavailable. Please try again later!';
//       });
//     }
//
//     this.editPassword = false;
//     this.changePassword = function() {
//       this.editPassword = true;
//     }
//
//     this.cancelPassword = function() {
//       this.editPassword = false;
//       this.isPasswordError = false;
//     }
//
//     this.savePassword = function() {
//       this.isPasswordError = false;
//       if(profile.oldPassword == profile.user.password) {
//         if(profile.newPassword == profile.verifyPassword) {
//           profile.editName = profile.user.name;
//           profile.editGender = profile.user.gender;
//           profile.editUsername = profile.user.username;
//           profile.editEmail = profile.user.email;
//           profile.user.password = profile.newPassword;
//           profile.saveProfile();
//           this.editPassword = false;
//         } else {
//           profile.isPasswordError = true;
//           profile.passwordError = 'New password should match with Verify password!';
//         }
//       } else {
//         profile.isPasswordError = true;
//         profile.passwordError = 'Your old password is wrong!';
//       }
//     }
//
//   }
// }
