// Database instance
var db = null;
console.log("Just created db object");

angular.module('collegeChefs', ['ionic', 'ngCordova', 'collegeChefs.controllers', 'collegeChefs.services', 'angular.filter', 'ngStorage','ui.router'])

.run(function ($ionicPlatform, $rootScope, $http, $location, $localStorage, $cordovaSQLite, $injector, $state) {
	$ionicPlatform.ready(function () {

    // Instantiate SQLite database connection after platform is ready
		db = $cordovaSQLite.openDB({ name: 'authentication.db', location: 'default' });
    console.log("Opened the database");
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Session (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, token TEXT)');
    console.log("Created the table");

    var AuthenticationService = $injector.get('AuthenticationService');
    $rootScope.userInfo = AuthenticationService.getUserInfo(db, function(result){
      if (!result) {
        $state.go('login');
      } else {
        console.log("username is: " + $rootScope.userInfo.username);
        console.log("firstname is: " + $rootScope.userInfo.firstname);
        console.log("house is: " + $rootScope.userInfo.house);

        console.log("$rootScope.userInfo = " + $rootScope.userInfo);
      }
    });

		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}

		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			//StatusBar.styleDefault();
		}
	});
})



/********************************************************/
	//prevents preflight by Chrome when testing locally,
	//COMMENT OUT FOR PRODUCTION

	// .config(function ($httpProvider) {
	// 	$httpProvider.defaults.headers.common = {};
	// 	$httpProvider.defaults.headers.post = {};
	// 	$httpProvider.defaults.headers.put = {};
	// 	$httpProvider.defaults.headers.patch = {};
	// })
/******************************************************/



.config(function ($ionicConfigProvider) {
	$ionicConfigProvider.tabs.position('bottom');
})
.config(function ($stateProvider, $urlRouterProvider) {
  // default route
  // return correct result based on datetime.now
  $urlRouterProvider.otherwise('/tab/meal/next');

  // app routes
	$stateProvider
		.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: 'templates/tabs.html',
			onEnter: function ($state, $injector) {
				// if user is not authenticated, go to welcome screen
        // query the db, see if there's a user id

        // if (!isAuthenticated) {
        //   $state.go('login');
        // }

        // var AuthenticationService = $injector.get('AuthenticationService');
        // // console.log(AuthenticationService);
        // AuthenticationService.getUserInfo();
        // if (NOT AUTHENTICATED) {
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
        console.log("Login state?");
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
});
