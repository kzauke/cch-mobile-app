// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('collegeChefs', ['ionic', 'collegeChefs.controllers', 'collegeChefs.services', 'angular.filter'])
	.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs)
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
	
	.config(function($ionicCloudProvider) {
  		$ionicCloudProvider.init({
		 "core": {
			"app_id": "d6716ba8"
		 }
	  });
	})	
	.config(function($ionicConfigProvider) {
		$ionicConfigProvider.tabs.position('bottom');
	})
	.config(function($stateProvider, $urlRouterProvider) {
	
		// Ionic uses AngularUI Router which uses the concept of states
		// Learn more here: https://github.com/angular-ui/ui-router
		// Set up the various states which the app can be in.
		// Each state's controller can be found in controllers.js
		$stateProvider
		
			// setup an abstract state for the tabs directive
			.state('tab', {
				url: '/tab',
				abstract: true,
				templateUrl: 'templates/tabs.html',
				
				
				onEnter: function($state, $ionicAuth){		
					//if user is not authenticated, go to welcome screen
				  if(!$ionicAuth.isAuthenticated()){
                        //$state.go('login');
					}
					
					
					//if user is authenticated, but their activation code isn't valid
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
				controller: 'LoginCtrl'
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
	});
	
	// if none of the above states are matched, use this as the fallback
	
	$urlRouterProvider.otherwise('/tab/meal/next');  //return correct result based on datetime.now

});

