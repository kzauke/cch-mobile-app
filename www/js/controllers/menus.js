(function() {
'use strict';

  angular
    .module('collegeChefs')
    .controller('MenusController', MenusController);

  MenusController.$inject = ['$scope', 'Account', 'Globals', 'Menus', '$state', '$ionicViewSwitcher', '$stateParams', '$ionicScrollDelegate', '$location', '$anchorScroll', '$ionicPlatform', '$ionicLoading', '$ionicModal', '$window', '$timeout'];
  function MenusController($scope, Account, Globals, Menus, $state, $ionicViewSwitcher, $stateParams, $ionicScrollDelegate, $location, $anchorScroll, $ionicPlatform, $ionicLoading, $ionicModal, $window, $timeout) {
    console.log("MenusController has initialized");

    $scope.userId = Account.getUser().then(
      function(success) {
        var userInfo = Account.getUserInfo(success);
        return userInfo.id;
      },
      function(error) {
        console.log("Unable to get `userInfo` object");
      }
    );

    $scope.getMealListings = Menus.getAll($scope.userId);

    $scope.noItemsMessage = '<i class="padding icon icon-strawberry assertive no-items-icon"></i><p>There is no meal data available.<br />Please try back later.</p>';
    $scope.noItems = "";

    $scope.getFormattedDate = function (mealDate) {
    return Globals.getFormattedDate(mealDate);
  };


















    //////////////////////////

    $scope.greeting = "Hello, World!";

    $scope.HelloWorld = function() {
      $ionicPopup.alert({
        title: $scope.greeting,
        template: 'This is the best template to start',
        cssClass: 'animated bounceInDown'
      });
    };

    $scope.items = {
      one: {
        id: 1,
        title: "What"
      },
      two: {
        id: 2,
        title: "Is Going"
      },
      three: {
        id: 3,
        title: "On????"
      }
    };

  }
})();
