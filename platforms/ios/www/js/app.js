// // Database instance
// var db = null;
// console.log("Just created db object");

angular.module('collegeChefs', ['ionic', 'ngCordova', 'collegeChefs.controllers', 'collegeChefs.services', 'angular.filter', 'ngStorage', 'ui.router'])

.run(['$ionicPlatform',
      '$sqliteFactory',
      function($ionicPlatform, $sqliteFactory, $rootScope, $cordovaSQLite, $injector, $state) {
  $ionicPlatform.ready(function() {

    // // Instantiate SQLite database connection after platform is ready
    // db = $cordovaSQLite.openDB({ name: 'options.db', location: 'default' });
    // console.log("Opened the database");
    // $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Session (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, token TEXT)');
    // console.log("Created the table, if it doesn't exist yet.");



    // var AuthenticationService = $injector.get('AuthenticationService');
    // $rootScope.userInfo = AuthenticationService.getUserInfo(db, function(result){
    //   if (!result) {
    //     $state.go('login');
    //   } else {
    //     console.log("username is: " + $rootScope.userInfo.username);
    //     console.log("firstname is: " + $rootScope.userInfo.firstname);
    //     console.log("house is: " + $rootScope.userInfo.house);

    //     console.log("$rootScope.userInfo = " + $rootScope.userInfo);
    //   }
    // });

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default
      // (remove to show accessory bar above keyboard for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // HEY! Don't remove this unless you know what you are doing!
      // It stops the viewport from snapping when text inputs are focused.
      // Ionic handles this internally for a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      // StatusBar.styleDefault();
    }
	});
}])

/********************************************************/
	// prevents preflight by Chrome when testing locally,
	// COMMENT OUT FOR PRODUCTION

	// .config(function ($httpProvider) {
	// 	$httpProvider.defaults.headers.common = {};
	// 	$httpProvider.defaults.headers.post = {};
	// 	$httpProvider.defaults.headers.put = {};
	// 	$httpProvider.defaults.headers.patch = {};
	// })
/******************************************************/

.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
  $ionicConfigProvider.tabs.position('bottom');

  // app routes
	$stateProvider
		.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: 'templates/tabs.html',
			onEnter: function ($state) {
				// if user is not authenticated, go to welcome screen
        // query the db, see if there's a user id

        // if (!isAuthenticated) {
          // $state.go('login');
        // }
			}
		})
		// Each tab has its own nav history stack:
		.state('tab.menus', {
			url: '/menus',
			views: {
				'tab-menus': {
					templateUrl: 'templates/tab-menus.html',
					controller: 'MenusCtrl'
				}
			}
		})
    .state('tab.meal', {
			url: '/meal/:menuId',
			views: {
				'tab-meal': {
					templateUrl: 'templates/tab-meal.html',
					controller: 'MenusCtrl'
				}
			}
		})
    .state('tab.meal/:menuId', {
			url: '/meal/:menuId',
			views: {
				'tab-meal': {
					templateUrl: 'templates/tab-meal.html',
					controller: 'MenusCtrl'
				}
			}
		})
    .state('tab.reviews', {
			url: '/reviews',
			views: {
				'tab-reviews': {
					templateUrl: 'templates/tab-reviews.html',
					controller: 'ReviewsCtrl'
				}
			}
		})
    .state('tab.profile', {
			url: '/profile',
			views: {
				'tab-account': {
					templateUrl: 'templates/profile.html',
					controller: 'EditProfileCtrl'
				}
			}
		})
    .state('tab.password', {
			url: '/password',
			views: {
				'tab-account': {
					templateUrl: 'templates/password.html',
					controller: 'PasswordCtrl'
				}
			}
		})
    .state('tab.contact', {
			url: '/contact',
			views: {
				'tab-account': {
					templateUrl: 'templates/contact.html',
					controller: 'ContactUsCtrl'
				}
			}
		})
    .state('tab.reporting', {
			url: '/reporting',
			views: {
				'tab-account': {
					templateUrl: 'templates/reporting.html',
					controller: 'ReportBugCtrl'
				}
			}
		})
    .state('tab.help', {
			url: '/help',
			views: {
				'tab-account': {
					templateUrl: 'templates/help.html',
					controller: 'HelpCtrl'
				}
			}
		})
    .state('tab.help/:faqId', {
			url: '/help/:faqId',
			views: {
				'tab-account': {
					templateUrl: 'templates/help-detail.html',
					controller: 'HelpDetailCtrl'
				}
			}
		})
    .state('tab.account', {
			url: '/account',
			views: {
				'tab-account': {
					templateUrl: 'templates/tab-account.html',
					controller: 'AccountCtrl'
				}
			}
		})
    .state('activation', {
			url: '/activation',
			templateUrl: 'templates/activation.html',
			controller: 'ActivationCtrl'
		})
    .state('login', {
			url: '/login',
			templateUrl: 'templates/login.html',
			controller: 'LoginCtrl',
			controllerAs: 'vm',
      onEnter: function ($state) {
        console.log("You have now entered the login state");
      }
		})
    .state('forgot-password', {
			url: '/forgot-password',
			templateUrl: 'templates/forgot-password.html',
			controller: 'ForgotPasswordCtrl'
		})
    .state('request-activation', {
			url: '/request-activation',
			templateUrl: 'templates/request-activation.html',
			controller: 'RequestActivationCtrl'
		})
    .state('register', {
			url: '/register',
			templateUrl: 'templates/register.html',
			controller: 'RegisterCtrl'
		})
    .state('welcome', {
			url: '/welcome',
			templateUrl: 'templates/welcome.html',
			controller: 'WelcomeCtrl'
		}
  );

  // default route
  // return correct result based on datetime.now
  $urlRouterProvider.otherwise('/tab/meal/next');
}]);
