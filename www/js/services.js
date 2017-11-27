angular.module('collegeChefs.services', ['ionic.cloud'])

// clean up by reading this article
// http://stackoverflow.com/questions/30752841/how-to-call-other-functions-of-same-services-in-ionic-angular-js

.service('$sqliteService', function($q, $cordovaSQLite) {
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
      // console.log("Rows length: " + result.rows.length);
      if (result.rows.length > 0) {
        return deferred.resolve(result.rows.item(0));
      } else {
        return deferred.reject("There aren't items matching");
      }
    }, function(error) {
      return deferred.reject(error);
    });

    return deferred.promise;
  };

  self.loadDatabase = function(enableLog) {
    var deferred = $q.defer();

    var queries = [
      "DROP TABLE IF EXISTS Session;",
      "CREATE TABLE Session(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, token TEXT NOT NULL);"
    ];

    self.db().transaction(function(result) {
      for (var i = 0; i < queries.length; i++) {
        var query = queries[i].replace(/\\n/g, '\n');

        if(enableLog) console.log(queries[i]);
        result.executeSql(query);
      }
    }, function(error) {
      deferred.reject(error);
    }, function() {
      deferred.resolve("OK");
    });

    return deferred.promise;
  };

  self.executeSql = function(query, parameters) {
    return $cordovaSQLite.execute(self.db(), query, parameters);
  };
})

.factory('AuthenticationService',  function($q, $http, $sqliteService){
  console.log("AuthenticationService factory initialized");

  // Load the database, true = debug
  $sqliteService.loadDatabase(true);

  var _token;

  return {
    // getToken: function(username, password) {
    //   console.log("getToken() running");
    //   var loginAPI = "http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetDNNAuthUserData";
    //   var config = { params: { username: username, password: password } };

    //   return $http.get(loginAPI, config).then(function(response) {
    //     if (response.data.token) {
    //       return response.data.token;
    //     }
    //   });
    // },

    login: function(username, password, callback) {
      var loginAPI = "http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetDNNAuthUserData";
      var config = { params: { username: username, password: password } };

      $http.get(loginAPI, config)
        .success(function(response) {
          if (response.token) {
            $q.when($sqliteService.executeSql("INSERT INTO Session(username, token) VALUES (?, ?)", [username, response.token]));
            callback(true);
          } else {
            callback(false);
          }
        })
        .error(function(error) {
          console.log(error);
          callback(false);
        });
    },

  }
})

.factory('Account', function($q, $http, $sqliteService) {
  console.log("Account factory initialized");

  var _userInfo;

  return {
    getUser: function() {
      var query = "SELECT * FROM Session ORDER BY id DESC";
      return $q.when($sqliteService.getFirstItem(query));
    },

    getUserInfo: function(user) {
      if (!_userInfo) {
        var decoded = jwt_decode(user.token);
        _userInfo = {
          // id: decoded.user_id,
          id: 6441,
          username: decoded.custom.username,
          email: decoded.custom.email,
          firstname: decoded.custom.firstname,
          lastname: decoded.custom.lastname,
          // house: decoded.custom.house,
          house: "Alpha Beta Testa",
          // chef: decoded.custom.chef,
          chef: "Swedish Chef",
          supervisor: decoded.custom.supervisor
        };

        console.log(_userInfo);
      }

      return _userInfo;
    },

    updateProfile: function($state) {
      // submit new user data to DB, refresh data
      console.log('profile saved');
      $state.go('tab.account');
    },

    updatePassword: function($state) {
      // submit new user data to DB, refresh data
      console.log('password saved');
      $state.go('tab.account');
    },

    registerUser: function(loginData) {
      console.log("registerUserNEW() running");

      var registerAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=RegisterAppUser&firstname=' + loginData.firstname + '&lastname=' + loginData.lastname + '&email=' + loginData.email + '&activation=' + loginData.activation;

      return $http.get(registerAPI).then(function(response) {
        return response.data;
      });
    },

    getRegistrationError: function(error) {
      var _placeholder;

      if (error === "UsernameAlreadyExists") {
        _placeholder = "A user with that email address is already registered. Would you like to <a href='#/login'>log in now?</a>";
      } else if (error === "ActivationNotValid") {
        _placeholder = "Your house code is invalid. To get the correct house code for your house, please talk to your chef.";
      } else {
        _placeholder = "Something went wrong when creating your account. <a href='#/contact'>Please contact us for further assistance.</a>";
      }
      console.log(_placeholder);
      return _placeholder;
    },

    // registerUser__OLD: function($state, $ionicViewSwitcher, method, loginData, $location, $q) {
    //   var placeholder = {};
    //   var defer = $q.defer();

    //   // send registration data to custom handler that adds user to our system
    //   var registerURL = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=RegisterAppUser&firstname=' + loginData.firstname + '&lastname=' + loginData.lastname + '&email=' + loginData.email + '&activation=' + loginData.activation;

    //   var location = $location;

    //   $http.get(registerURL).then(
    //     function(response) {
    //       // if return message is an error
    //       if (response.data.error !== undefined) {
    //         if (response.data.error === "UsernameAlreadyExists") {
    //           placeholder.text = "A user with that email address is already registered. Would you like to <a href='#/login'>log in now?</a>";
    //         } else if (response.data.error === "ActivationNotValid") {
    //           placeholder.text = "Your house code is invalid. To get the correct house code for your house, please talk to your chef.";
    //         } else {
    //           placeholder.text = "Something went wrong when creating your account. <a href='#/contact'>Please contact us for further assistance.</a>";
    //         }
    //       } else if (response.data.token !== undefined) {
    //         var expToken = response.data.token;

    //         // decode token
    //         var decoded = jwt_decode(expToken);
    //         // console.log(decoded.username);

    //         // if valid, authenticate user with our custom login
    //         var loginOptions = {
    //           'inAppBrowserOptions': {
    //             'hidden': true
    //           }
    //         };

    //         var loginData = {
    //           'username': decoded.username,
    //           'password': decoded.password
    //         };

    //         $ionicAuth.login('custom', loginData, loginOptions).then(function(s) {
    //           if ($ionicAuth.isAuthenticated()) {
    //             location.path('/tab/meal/next');
    //           }
    //         }, function(e) {
    //           console.log(e);
    //         });
    //       } else {
    //         console.log("Something went wrong while registering your account. Please contact your administrator");
    //       }
    //     }
    //   );
    //   defer.resolve();
    //   return placeholder;
    // },

    requestActivation: function($state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      console.log("request activation");
      $state.go('register');
    },

    backToWelcome: function($state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      $state.go('login');
    },

    newPasswordRequest: function($state) {
      console.log('password request');
      $state.go('login');
    },

    logout: function($state, $ionicViewSwitcher) {
      $sqliteService.executeSql('DROP TABLE IF EXISTS Session')
        .then(function(result) {
            console.log("Session table deleted");
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('login');
        }, function(error) {
            console.log("Error deleting table: " + error.message);
        }
      );
    }
  };
})

.factory('Menus', function($http, Account, $ionicLoading, $cacheFactory, $ionicUser, $window, $timeout) {
  console.log("Menus factory initialized");

  var Menus = this;

  // 24 hour clock
  var lunchLPEndTime = 10; // no lunch late plate orders after 10am
  var dinnerLPEndTime = 15; // no dinner late plate orders after 3pm
  var afterDinnerLPEndTime = 20; // dinner ends after 8pm

  var dataSource = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetMeals&UserID=';

  return {
    getMealData: function(userId) {
      dataSourceWithId = dataSource + userId;
      return $http.get(dataSourceWithId, {
        cache: true
      });
    },

    organizeMeals: function(mealData, menuId) {
      var meals = mealData.data;
      var mealListings = [];
      var isNextMeal = true;

      for (var i = 0; i < meals.length; i++) {

        if (this.mealHasPassed(meals[i].name, meals[i].date)) {
          meals[i].hasPassed = true;
          meals[i].isNext = false;
        } else {
          meals[i].hasPassed = false;

          if (isNextMeal) {
            meals[i].isNext = true;
            isNextMeal = false;
          } else {
            meals[i].isNext = false;
          }
        }

        mealListings[i] = meals[i];
      }

      return mealListings;
    },

    mealHasPassed: function(mealType, mealDate) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var mealDateTime = new Date(mealDate);
      mealDateTime.setHours(0, 0, 0, 0);

      // if meal date is before today return true
      if (mealDateTime < today) {
        return true;
      }

      // if meal date is after today return false
      if (mealDateTime > today) {
        return false;
      }

      // if meal date is today
      if (mealDateTime.getUTCDate() === today.getUTCDate()) {

        var curTime = new Date().getHours();

        switch (mealType) {
          case "Breakfast":
            // if meal type is breakfast and current time is after lunchLPEndTime(10) return true
            if (curTime >= lunchLPEndTime) {
              return true;
            }
            break;
          case "Lunch":
            // if meal type is lunch and current time is after dinnerLPEndTime(3) return true
            if (curTime >= dinnerLPEndTime) {
              return true;
            }
            break;
          case "Dinner":
            // if meal type is dinner and current time is after afterDinnerLPEndTime (8) return true
            if (curTime >= afterDinnerLPEndTime) {
              return true;
            }
            break;
        }
      }
      // default to false
      return false;
    },

    requestLatePlate: function($scope, mealId) {
      var latePlateSubmitAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=SubmitLatePlateOrder&UserID=' + $scope.userInfo.id + '&MealID=' + mealId;

      return $http.get(latePlateSubmitAPI).then(function(response) {
        if (response.data) {
          return response.data;
        }
      });
    },

    cancelLatePlate: function($scope, mealId) {
      var latePlateCancelAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=CancelLatePlateOrder&UserID=' + $scope.userInfo.id + '&MealID=' + mealId;

      return $http.get(latePlateCancelAPI).then(function(response) {
        if (response.data) {
          return response.data;
        }
      });
    },

    getTodaysFirstMealIndex: function() {
      // return 8;
    },

    getLatePlateMsg: function(mealType, mealIsToday) {
      if (mealIsToday) {
        var latePlateString = "<span class='ion-android-time'></span> Late plate orders due by ";

        var lunchEnd = lunchLPEndTime + " a.m. today";
        var dinnerEnd = (dinnerLPEndTime - 12) + " p.m. today";

        switch (mealType) {
          case "Lunch":
            return latePlateString + lunchEnd;
          case "Dinner":
            return latePlateString + dinnerEnd;
        }
        return null;
      }
    },

    getIcon: function(mealType) {
      switch (mealType) {
        case "Breakfast":
          return "img/menu-breakfast.png";
        case "Lunch":
          return "img/menu-lunch.png";
        case "Dinner":
          return "img/menu-dinner.png";
      }
    },

    showLatePlateButton: function(mealHasPassed, mealType, mealIsToday) {
      var currHour = new Date().getHours();

      // don't show if meal has passed
      if (mealHasPassed) {
        return false;
      }

      // if meal is today, only show if it is still before cutoff times
      if (mealIsToday) {
        if (mealType === "Lunch" && (currHour >= lunchLPEndTime)) {
          return false;
        }
        if (mealType === "Dinner" && (currHour >= dinnerLPEndTime)) {
          return false;
        }
      }

      // show by default
      return true;
    },

    // navigate menu data
    goNext: function($index, $state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('forward');
      var nextIndex = Number($index) + 1;
      console.log("nextIndex: " + nextIndex);
      $state.go('tab.meal/:menuId', {
        menuId: nextIndex
      });
    },

    goBack: function($index, $state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      var prevIndex = Number($index) - 1;
      console.log("prevIndex: " + prevIndex);
      $state.go('tab.meal', {
        menuId: prevIndex
      });
    }
  };
})

.factory('Globals', function() {
  console.log("Globals factory initialized");

  return {
    backButton: function($ionicHistory) {
      $ionicHistory.goBack();
    },

    goForward: function($state, toState, $ionicViewSwitcher, params) {
      console.log('Globals.goForward() -- something something');
      $ionicViewSwitcher.nextDirection('forward');
      $state.go(toState, params);
    },

    isDateSame: function(d1, d2) {
      d1 = new Date(d1);
      d1.setHours(0, 0, 0, 0);
      d2 = new Date(d2);
      d2.setHours(0, 0, 0, 0);
      return (d1.getUTCDate() === d2.getUTCDate());
    },

    getFormattedDate: function(date) {
      date = new Date(date);

      var weekday = new Array(7);
      weekday[0] = "Sun";
      weekday[1] = "Mon";
      weekday[2] = "Tue";
      weekday[3] = "Wed";
      weekday[4] = "Thu";
      weekday[5] = "Fri";
      weekday[6] = "Sat";

      var month = new Array(12);
      month[0] = "Jan";
      month[1] = "Feb";
      month[2] = "Mar";
      month[3] = "Apr";
      month[4] = "May";
      month[5] = "Jun";
      month[6] = "Jul";
      month[7] = "Aug";
      month[8] = "Sep";
      month[9] = "Oct";
      month[10] = "Nov";
      month[11] = "Dec";

      // return weekday[date.getUTCDay()];

      if (isNaN(date.getUTCDay())) {
        return "";
      } else {
        return weekday[date.getUTCDay()] + ", " + month[date.getUTCMonth()] + " " + date.getUTCDate();
      }
    }
  };
})

.factory('Help', function() {
  console.log("Help factory initialized");

  var faqs = [{
    id: 1,
    question: 'Why can\'t I order a late plate for my next meal?',
    answer: '<p>Late plate orders for lunch must be placed by 10 a.m. the day of your meal. Late plate orders for dinner must be placed by 3 p.m. Late Plates are not available for breakfast.</p>'
  }, {
    id: 2,
    question: 'How do I cancel my late plate order?',
    answer: '<p>Please contact your chef to cancel a late plate order.</p>'
  }, {
    id: 3,
    question: 'How can I rate/review my meals?',
    answer: '<p>This feature is on our road map. Please stay tuned!</p>'
  }, {
    id: 4,
    question: 'Who is my chef?',
    answer: '<p>You can find your chef\'s name listed under the "Account" tab.</p>'
  }];

  return {

    // retrieve menu data
    all: function() {
      return faqs;
    },

    get: function(faqId) {
      for (var i = 0; i < faqs.length; i++) {
        if (faqs[i].id === parseInt(faqId)) {
          return faqs[i];
        }
      }
      return null;
    },

    submitBugReport: function() {
      // submit bug report here
    }
  };
});

var CollegeChefs = CollegeChefs || {};

CollegeChefs.helpers = {

  goToTodaysMeals: function($state, $ionicViewSwitcher) {
    $ionicViewSwitcher.nextDirection('forward');
    $state.go('tab.meal', {
      menuId: 1
    });
  },
};
