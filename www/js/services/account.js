(function() {
  'use strict';

  angular
    .module('collegeChefs')
    .factory('AccountService', AccountService);

  AccountService.$inject = ['$q', '$http', '$sqliteService'];
  function AccountService($q, $http, $sqliteService) {
    console.log("AccountService initialized");

    var _userInfo;
    var service = {
      getUser: getUser,
      getUserInfo: getUserInfo,
      logout: logout
    };
    return service;

    //////////

    function getUser() {
      var query = "SELECT * FROM Session ORDER BY id DESC";
      return $q.when($sqliteService.getFirstItem(query));
    };

    function getUserInfo() {
      console.log("inside getUserInfo()");
      if (!_userInfo) {
        console.log("inside (!_userInfo)");
        this.getUser().then(function(user) {

          var decoded = jwt_decode(user.token);

          console.log("Token has been decoded");

          _userInfo = {
            id: decoded.user_id,
            username: decoded.custom.username,
            email: decoded.custom.email,
            firstname: decoded.custom.firstname,
            lastname: decoded.custom.lastname,
            house: decoded.custom.house,
            chef: decoded.custom.chef,
            supervisor: decoded.custom.supervisor
          };

          console.log(_userInfo);

          console.log("ID: " + _userInfo.id);
          console.log("User: " + _userInfo.username);
          console.log("House: " + _userInfo.house);
          console.log("Supervisor: " + _userInfo.supervisor);
          console.log("Chef: " + _userInfo.chef);
        }, function(error) {
          console.log(error.message);
        });
      }

      return _userInfo;
    };

    function logout($state, $ionicViewSwitcher) {
      $sqliteService.executeSql('DROP TABLE IF EXISTS Session')
        .then(function(result) {
            console.log("Session table deleted");
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('login');
        }, function(error) {
            console.log("Error deleting table: " + error.message);
        }
      );
    };
  }
})();
