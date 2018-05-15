// College Chefs app
var appVersion = "0.0.0";

angular.module('collegeChefs', ['ionic', 'ngCordova', 'collegeChefs.controllers', 'collegeChefs.services', 'angular.filter', 'ngStorage', 'ui.router'])

.run(['$ionicPlatform',
      '$sqliteService',
      function($ionicPlatform, $sqliteService) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
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
      StatusBar.styleDefault();
    }
	});
}])

.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         '$ionicCloudProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicCloudProvider) {

  $ionicCloudProvider.init({
    "core": {
      "app_id": "d6716ba8"
    }
  });

  $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
  $ionicConfigProvider.tabs.position('bottom');

  // app routes
  $stateProvider
    .state('tab', {
      url: '/tab',
      templateUrl: 'templates/tabs.html',
      abstract: true,
      resolve: {
        resolvedUser: checkForAuthenticatedUser
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
					controller: 'MenusCtrl',
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
					controller: 'AccountCtrl'
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
      cache: false,
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

  // default route
  // return correct result based on datetime.now
  $urlRouterProvider.otherwise('/tab/meal/next');

  function checkForAuthenticatedUser(Account, $state) {
    return Account.getUser().then(
      function(_user) {
        // console.log(_user);
        _userInfo = Account.getUserInfo(_user);
        return _userInfo;
      },
      function(_error) {
        console.log("Error! " + _error);
        $state.go('login');
      }
    );
  }
}]);
