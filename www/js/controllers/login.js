(function() {
  'use strict';

  angular
    .module('collegeChefs')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$scope', '$location', 'AuthenticationService'];
  function LoginCtrl($scope, $location, AuthenticationService) {
    var vm = this;

    vm.formSubmit = formSubmit;

    function formSubmit() {
      AuthenticationService.login(vm.username, vm.password, function(result) {
        if (result === true) {
          $location.path('/tab/meal/next');
          // $location.path('/tab/account');
        } else {
          vm.error = 'There was an error logging you in. Please check your username or password and try again.';
        }
      });
    }

  }
})();
