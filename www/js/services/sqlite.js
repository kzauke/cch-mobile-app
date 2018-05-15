(function() {
  'use strict';

  angular
    .module('collegeChefs')
    .service('$sqliteService', $sqliteService);

  $sqliteService.$inject = ['$q', '$cordovaSQLite'];
  function $sqliteService($q, $cordovaSQLite) {
    console.log("$sqliteService initialized");

    var self = this;
    var _db;

    self.db = function() {
      if (!_db) {
        if (window.sqlitePlugin !== undefined) {
          _db = window.sqlitePlugin.openDatabase({ name: "options.db", location: 2, createFromLocation: 1 });
        } else {
          // For debugging in the browser
          console.warn("Storage: SQLite plugin not installed, falling back to WebSQL. Be sure to install cordova-sqlite-storage in production!");
          _db = window.openDatabase("options.db", "1.0", "Database", 200000);
        }
      }

      return _db;
    };

    self.getFirstItem = function(query, parameters) {
      var deferred = $q.defer();
      self.executeSql(query, parameters).then(function(result) {

        if (result.rows.length > 0) {
          return deferred.resolve(result.rows.item(0));
        } else {
          return deferred.reject("There aren't items matching");
        }
      }, function (error) {
        return deferred.reject(error);
      });

      return deferred.promise;
    };

    self.loadDatabase = function(enableLog) {
      var deferred = $q.defer();
      var queries = [
        "DROP TABLE IF EXISTS Session;",
        "CREATE TABLE Session (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, token TEXT NOT NULL);"
      ];

      self.db().transaction(function(result) {
        for (var i = 0; i < queries.length; i++) {
          var query = queries[i].replace(/\\n/g, '\n');

          if(enableLog) console.log(queries[i]);
          result.executeSql(query);
        }
      }, function(error) {
        deferred.reject(error);
      }, function () {
        deferred.resolve("OK");
      });

      return deferred.promise;
    };

    self.executeSql = function(query, parameters) {
      return $cordovaSQLite.execute(self.db(), query, parameters);
    };
  }
})();
