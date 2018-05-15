angular.module('collegeChefs.services', ['ionic.cloud'])

.service('$sqliteService', function($q, $cordovaSQLite) {
  // console.log("$sqliteService initialized");

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
    }, function(error) {
      return deferred.reject(error);
    });

    return deferred.promise;
  };

  self.executeSql = function(query, parameters) {
    return $cordovaSQLite.execute(self.db(), query, parameters);
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
})

.factory('AuthenticationService',  function($q, $http, $sqliteService){
  // console.log("AuthenticationService factory initialized");

  var _token;

  return {

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
          callback(false);
        });
    }
  }
})

.factory('Account', function($q, $http, $sqliteService) {
  // console.log("Account factory initialized");

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
          id: decoded.user_id,
          username: decoded.custom.username,
          email: decoded.custom.email,
          firstname: decoded.custom.firstname,
          lastname: decoded.custom.lastname,
          house: decoded.custom.house,
          chef: decoded.custom.chef,
          supervisor: decoded.custom.supervisor
        };
      }

      return _userInfo;
    },

    updateProfile: function($state) {
      $state.go('tab.account');
    },

    updatePassword: function($state) {
      $state.go('tab.account');
    },

    registerUser: function(loginData) {
      var registerAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=RegisterAppUser&firstname=' + loginData.firstname + '&lastname=' + loginData.lastname + '&email=' + loginData.email + '&activation=' + loginData.activation;

      return $http.get(registerAPI).then(function(response) {
        return response.data;
      });
    },

    getRegistrationError: function(error) {
      var _placeholder;

      if (error === "UsernameAlreadyExists") {
        _placeholder = "<p>A user with that email address is already registered. Would you like to log in or reset your password?</p><p><a href='#/login' class='button'>Log in</a><a href='http://chefnet.collegechefs.com/Password-Reset' class='button'>Reset password</a></p>";
      } else if (error === "ActivationNotValid") {
        _placeholder = "<p>Your house code is invalid. To get the correct house code for your house, please talk to your chef.</p>";
      } else {
        _placeholder = "<p>Something went wrong when creating your account. Please contact us for further assistance.</p><p><a href='#/contact' class='button'>Contact us</a></p>";
      }

      return _placeholder;
    },

    requestActivation: function($state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      $state.go('register');
    },

    backToWelcome: function($state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      $state.go('login');
    },

    newPasswordRequest: function($state) {
      $state.go('login');
    },

    logout: function($state, $ionicViewSwitcher) {
      $sqliteService.executeSql('DROP TABLE IF EXISTS Session')
        .then(function(result) {
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('login');
            window.location.reload();
        }, function(error) {
            console.log("Error deleting table: " + error.message);
        }
      );
    }
  };
})

.factory('Menus', function($http, Globals, Account, $ionicLoading, $cacheFactory, $ionicUser, $window, $timeout) {
  // console.log("Menus factory initialized");

  var Menus = this;

  var timeNow = new Date().getHours();

  // 24 hour clock
  var latePlateLunchTime = 10; // no lunch late plate orders after 10am
  var lunchEndTime = 16; // lunch ends after 2pm
  var latePlateDinnerTime = 15; // no dinner late plate orders after 3pm
  var dinnerEndTime = 20; // dinner ends after 8pm

  var dataSource = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetMeals&UserID=';

  return {
    getMealData: function(userId) {
      dataSourceWithId = dataSource + userId;
      return $http.get(dataSourceWithId, { cache: true });
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

    mealIsToday: function(mealDate) {
      var d1 = new Date();
      var d2 = new Date(mealDate);
      return Globals.isDateSame(d1, d2);
    },

    mealHasPassed: function(mealType, mealDate) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var mealDateTime = new Date(mealDate);
      mealDateTime.setHours(0, 0, 0, 0);

      if (mealDateTime < today) return true;

      if (mealDateTime > today) return false;

      if (mealDateTime.getUTCDate() === today.getUTCDate()) {

        switch (mealType) {
          case "Breakfast":
            if (timeNow >= latePlateLunchTime) return true;
            break;
          case "Lunch":
            if (timeNow >= lunchEndTime) return true;
            break;
          case "Dinner":
            if (timeNow >= dinnerEndTime) return true;
            break;
          default:
            break;
        }
      }

      return false;
    },

    requestLatePlate: function($scope, mealId) {
      var latePlateSubmitAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=SubmitLatePlateOrder&UserID=' + $scope.userInfo.id + '&MealID=' + mealId;

      return $http.get(latePlateSubmitAPI).then(function(response) {
        if (response.data) return response.data;
      });
    },

    cancelLatePlate: function($scope, mealId) {
      var latePlateCancelAPI = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=CancelLatePlateOrder&UserID=' + $scope.userInfo.id + '&MealID=' + mealId;

      return $http.get(latePlateCancelAPI).then(function(response) {
        if (response.data) return response.data;
      });
    },

    getTodaysFirstMealIndex: function() {},

    getLatePlateMsg: function(mealType, mealDate, showIcon) {
      if (this.mealIsToday(mealDate)) {

        if (!this.latePlateDeadlineHasPassed(mealType, mealDate)) {
           var icon = showIcon ? "<i class='icon icon-clock'></i> " : "";
          var latePlateString = "Late Plate orders due by ";

          var lunchEnd = latePlateLunchTime + " a.m. today!";
          var dinnerEnd = (latePlateDinnerTime - 12) + " p.m. today!";

          switch (mealType) {
            case "Lunch":
              return icon + latePlateString + lunchEnd;
            case "Dinner":
              return icon + latePlateString + dinnerEnd;
          }
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

    latePlateDeadlineHasPassed: function(mealType, mealDate) {
      if (this.mealIsToday(mealDate)) {
        if (mealType === "Lunch" && (timeNow >= latePlateLunchTime)) {
          return true;
        }
        if (mealType === "Dinner" && (timeNow >= latePlateDinnerTime)) {
          return true;
        }
      }

      return false;
    },

    showLatePlateButton: function(mealType, mealDate) {
      if (this.mealHasPassed(mealType, mealDate)) {
        return false;
      }

      if (this.latePlateDeadlineHasPassed(mealType, mealDate)) {
        return (timeNow < lunchEndTime);
      }

      return true;
    },

    goNext: function($index, $state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('forward');
      var nextIndex = Number($index) + 1;
      $state.go('tab.meal/:menuId', { menuId: nextIndex });
    },

    goBack: function($index, $state, $ionicViewSwitcher) {
      $ionicViewSwitcher.nextDirection('back');
      var prevIndex = Number($index) - 1;
      $state.go('tab.meal', { menuId: prevIndex });
    }
  };
})

.factory('Globals', function() {
  // console.log("Globals factory initialized");

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

      if (isNaN(date.getUTCDay())) {
        return "";
      } else {
        return weekday[date.getUTCDay()] + ", " + month[date.getUTCMonth()] + " " + date.getUTCDate();
      }
    }
  };
})

.factory('Help', function() {
  // console.log("Help factory initialized");

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
    $state.go('tab.meal', { menuId: 1 });
  },
};
