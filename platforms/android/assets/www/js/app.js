// Database instance
var db = null;
var isAuthenticated = false;
var userInfo;

angular.module('collegeChefs', ['ionic', 'ngCordova', 'collegeChefs.controllers', 'collegeChefs.services', 'angular.filter', 'ngStorage','ui.router'])
	.run(function ($ionicPlatform, $rootScope, $http, $location, $localStorage, $cordovaSQLite, $injector, $state) {
		$ionicPlatform.ready(function () {

      // Instantiate SQLite database connection after platform is ready
			db = $cordovaSQLite.openDB({ name: 'authentication.db', location: 'default' });
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Session (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, token TEXT)');

			// keep user logged in after page refresh
			if ($localStorage.currentUser) {
					// $http.defaults.headers.common.Authorization = 'Bearer ' + $localStorage.currentUser.token;
			}

      var AuthenticationService = $injector.get('AuthenticationService');
      userInfo = AuthenticationService.getUserInfo(db);

      console.log(userInfo);

      if (userInfo.id != null) {
        isAuthenticated = true;
        $state.go('tab.account');
      } else {
        $state.go('login');
      }

			// // redirect to login page if not logged in and trying to access a restricted page
			// $rootScope.$on('$locationChangeStart', function (event, next, current) {
			// 		var publicPages = ['/login'];
			// 		var restrictedPage = publicPages.indexOf($location.path()) === -1;
			// 		if (restrictedPage) {
			// 				$location.path('/login');
			// 		}
			// });

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

          if (!isAuthenticated) {
            $state.go('login');
          }

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
  			controllerAs: 'vm'
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
	}
);
