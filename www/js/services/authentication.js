(function() {
  'use strict';

  angular
    .module('collegeChefs')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$q', '$http', '$sqliteService'];
  function AuthenticationService($q, $http, $sqliteService) {
    console.log("AuthenticationService initialized");

    // Load the database, true = debug
    $sqliteService.loadDatabase(true);


    var _token;
    var service = {
      login: login
    };
    return service;

    //////////

    function login(username, password, callback) {
      var loginAPI = "http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetDNNAuthUserData";
      var config = { params: { username: username, password: password } };

      $http.get(loginAPI, config)
        .success(function(response) {
          if (response.token) {
            $q.when($sqliteService.executeSql("INSERT INTO Session (username, token) VALUES (?, ?)", [username, response.token]));
            callback(true);
          } else {
            callback(false);
          }
        })
        .error(function(error) {
          console.log(error);
          callback(false);
        });
    }
  }
})();
