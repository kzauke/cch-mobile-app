(function() {
'use strict';

  angular
    .module('collegeChefs')
    .controller('AccountCtrl', AccountCtrl);

  AccountCtrl.$inject = ['$scope', 'Account', '$state', '$ionicViewSwitcher', '$timeout', '$ionicHistory'];
  function AccountCtrl($scope, Account, $state, $ionicViewSwitcher, $timeout, $ionicHistory) {
    var vm = this;

    vm.logout = logout;
    vm.userInfo = Account.getUserInfo();

    //////////

    function logout() {
      Account.logout($state, $ionicViewSwitcher);
      $timeout(function() {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        console.log("Clear cache and history");
      }, 150);
    };
  }
})();
