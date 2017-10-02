angular.module('collegeChefs.services', ['ionic.cloud'])

// clean up by reading this article
//http://stackoverflow.com/questions/30752841/how-to-call-other-functions-of-same-services-in-ionic-angular-js

.factory('Menus', function ($http, $ionicLoading, $cacheFactory, $ionicUser, $window, $timeout) {
	var Menus = this;

	var userid = CollegeChefs.helpers.getUserID($ionicUser);

	var dataSource = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetMeals&UserID=' + userid;

	//24 hour clock
	var lunchLPEndTime = 10; //no lunch late plate orders after 10am
	var dinnerLPEndTime = 15; //no dinner late plate orders after 3pm
	var afterDinnerLPEndTime = 20; //dinner ends after 8pm

	return {

		//late plate request 
		requestLatePlate: function ($scope, mealId) {
			var latePlateURL = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=SubmitLatePlateOrder&UserID=' + userid + '&MealID=' + mealId;

			$http.get(latePlateURL).then(
				function successCallback(response) {

					$scope.meal.latePlateStatus = 'pending';
					$window.location.reload();

					$scope.modal.hide();

				},
				function errorCallback(response) {
					$scope.modal.hide();
					console.log(response);
				}
			);

		},

		//cancel late plate request 
		cancelLatePlate: function ($scope, mealId) {
			var cancelLatePlateURL = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=CancelLatePlateOrder&UserID=' + userid + '&MealID=' + mealId;

			$http.get(cancelLatePlateURL).then(
				function successCallback(response) {

					$window.location.reload();

					$scope.modal.hide();

				},
				function errorCallback(response) {
					$scope.modal.hide();
					console.log(response);
				}
			);

		},

		//retrieve menu data 
		getAll: function () {
			return $http.get(dataSource, {
				cache: true
			});
		},

		getTodaysFirstMealIndex: function () {
			//return 8; 
		},

		getLatePlateMsg: function (mealType, mealIsToday) {
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

		getIcon: function (mealType) {
			switch (mealType) {
				case "Breakfast":
					return "img/menu-breakfast.png";
				case "Lunch":
					return "img/menu-lunch.png";
				case "Dinner":
					return "img/menu-dinner.png";
			}
		},

		mealHasPassed: function (mealType, mealDate) {

			var today = new Date();
			today.setHours(0, 0, 0, 0);

			var mealDateTime = new Date(mealDate);
			mealDateTime.setHours(0, 0, 0, 0);


			//if meal date is before today return true
			if (mealDateTime < today) {
				return true;
			}

			//if meal date is after today return false
			if (mealDateTime > today) {
				return false;
			}

			//if meal date is today
			if (mealDateTime.getUTCDate() === today.getUTCDate()) {

				var curTime = new Date().getHours();

				switch (mealType) {
					case "Breakfast":
						//if meal type is breakfast and current time is after lunchLPEndTime(10) return true
						if (curTime >= lunchLPEndTime) {
							return true;
						}
						break;
					case "Lunch":
						//if meal type is lunch and current time is after dinnerLPEndTime(3) return true
						if (curTime >= dinnerLPEndTime) {
							return true;
						}
						break;
					case "Dinner":
						//if meal type is dinner and current time is after afterDinnerLPEndTime (8) return true
						if (curTime >= afterDinnerLPEndTime) {
							return true;
						}
						break;
				}
			}
			//default to false
			return false;
		},

		showLatePlateButton: function (mealHasPassed, mealType, mealIsToday) {

			var currHour = new Date().getHours();

			//dont show if meal has passed
			if (mealHasPassed) {
				return false;
			}

			//if meal is today, only show if it is still before cutoff times
			if (mealIsToday) {
				if (mealType === "Lunch" && (currHour >= lunchLPEndTime)) {
					return false;
				}
				if (mealType === "Dinner" && (currHour >= dinnerLPEndTime)) {
					return false;
				}
			}

			//show by default
			return true;
		},

		//navigate menu data
		goNext: function ($index, $state, $ionicViewSwitcher) {
			$ionicViewSwitcher.nextDirection('forward');
			var nextIndex = Number($index) + 1;
			$state.go('tab.meal', {
				menuId: nextIndex
			});
		},

		goBack: function ($index, $state, $ionicViewSwitcher) {
			$ionicViewSwitcher.nextDirection('back');
			var prevIndex = Number($index) - 1;
			$state.go('tab.meal', {
				menuId: prevIndex
			});
		}

	};
})

.factory('Account', function ($http, $ionicAuth, $ionicFacebookAuth, $ionicUser) {

	//get user data from DB
	return {
		getUserInfo: function () {

			var userInfo = {
				userid: $ionicUser.get('dnnuserid'),
				chef: $ionicUser.get('chef'),
				lastname: $ionicUser.get('lastname'),
				supervisor: $ionicUser.get('supervisor'),
				house: $ionicUser.get('house'),
				username: $ionicUser.get('username'),
				email: $ionicUser.get('email'),
				firstname: $ionicUser.get('firstname')
			};

			return userInfo;
		},

		updateProfile: function ($state) {
			//submit new user data to DB, refresh data

			console.log('profile saved');
			$state.go('tab.account');
		},

		updatePassword: function ($state) {
			//submit new user data to DB, refresh data
			console.log('password saved');
			$state.go('tab.account');
		},

		registerUser: function ($state, $ionicViewSwitcher, method, loginData, $location, $q) {

			var placeholder = {};
			var defer = $q.defer();


			//send registration data to custom handler that adds user to our system
			var registerURL = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=RegisterAppUser&firstname=' + loginData.firstname + '&lastname=' + loginData.lastname + '&email=' + loginData.email + '&activation=' + loginData.activation;

			var location = $location;

			$http.get(registerURL).then(
				function (response) {
					//if return message is an error
					if (response.data.error !== undefined) {
						if (response.data.error === "UsernameAlreadyExists") {
							placeholder.text = "A user with that email address is already registered. Would you like to <a href='#/login'>log in now?</a>";
						} else if (response.data.error === "ActivationNotValid") {
							placeholder.text = "Your house code is invalid. To get the correct house code for your house, please talk to your chef.";
						} else {
							placeholder.text = "Something went wrong when creating your account. <a href='#/contact'>Please contact us for further assistance.</a>";
						}
					} else if (response.data.token !== undefined) {
						var expToken = response.data.token;
						//decode token
						var decoded = jwt_decode(expToken);
						console.log(decoded.username);
						//if valid, authenticate user with our custom login
						var loginOptions = {
							'inAppBrowserOptions': {
								'hidden': true
							}
						};

						var loginData = {
							'username': decoded.username,
							'password': decoded.password
						};

						$ionicAuth.login('custom', loginData, loginOptions).then(function (s) {
							if ($ionicAuth.isAuthenticated()) {
								location.path('/tab/meal/next');

							}
							//else display error
						}, function (e) {
							console.log(e);
						});
					} else {
						console.log("Something went wrong while registering your account. Please contact your administrator");
					}

				}
			);
			defer.resolve();
			return placeholder;
		},

		requestActivation: function ($state, $ionicViewSwitcher) {
			$ionicViewSwitcher.nextDirection('back');
			console.log("request activation");
			$state.go('register');

		},

		backToWelcome: function ($state, $ionicViewSwitcher) {
			$ionicViewSwitcher.nextDirection('back');
			$state.go('login');
		},

		newPasswordRequest: function ($state) {
			console.log('password request');
			$state.go('login');
		},

		authenticateUser: function ($state, $ionicViewSwitcher, method, loginData, $location) {
			var placeholder = {};
			var errorMessageText = "There was an error logging in. Please check your credentials and try again.";

			if (method === 'chefnet') {
				var loginOptions = {
					'inAppBrowserOptions': {
						'hidden': true
					}
				};
				$ionicAuth.login('custom', loginData, loginOptions).then(function (s) {

				}, function (e) {
					placeholder.text = errorMessageText;
					return placeholder;
				});

				if ($ionicAuth.isAuthenticated()) {
					$location.path('/tab/meal/next');
				} else {
					setTimeout(function () {
						placeholder.text = errorMessageText;
						return placeholder;
					}, 500);

				}

				//placeholder.text = errorMessageText;         
				//return placeholder;
			}



			if (method === 'facebook') {
				/*
			 $ionicFacebookAuth.login().then(
			 
			 //is this user in dnn?
			 //is there a house specified for this user?
			 	//if no
					//request activation code (rsvp)
			 
			 );
			 */
			}

			if (method === 'twitter') {
				$ionicAuth.login('twitter').then(
					//do something
				);
			}

			//CollegeChefs.helpers.goToTodaysMeals($state, $ionicViewSwitcher);

		},

		logoff: function ($state, $ionicViewSwitcher) {
			$ionicAuth.logout();
			$ionicViewSwitcher.nextDirection('forward');
			$state.go('login');
		}
	};
})

.factory('Globals', function () {
	return {
		backButton: function ($ionicHistory) {
			$ionicHistory.goBack();
		},
		goForward: function ($state, toState, $ionicViewSwitcher, params) {
			console.log('something something');
			$ionicViewSwitcher.nextDirection('forward');
			$state.go(toState, params);
		},
		isDateSame: function (d1, d2) {
			d1 = new Date(d1);
			d1.setHours(0, 0, 0, 0);
			d2 = new Date(d2);
			d2.setHours(0, 0, 0, 0);
			return (d1.getUTCDate() === d2.getUTCDate());
		},
		getFormattedDate: function (date) {
			date = new Date(date);

			var weekday = new Array(7);
			weekday[0] = "Sun";
			weekday[1] = "Mon";
			weekday[2] = "Tues";
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
			month[8] = "Sept";
			month[9] = "Oct";
			month[10] = "Nov";
			month[11] = "Dec";

			//return weekday[date.getUTCDay()];

			if (isNaN(date.getUTCDay())) {
				return "";
			} else {
				return weekday[date.getUTCDay()] + ", " + month[date.getUTCMonth()] + " " + date.getUTCDate();
			}
		},
	};
})

.factory('AuthenticationService', function($http,$localStorage){
	
	var service = {};
 

	service.Login = Login;
	service.Logout = Logout;

	return service;

	function Login(username, password, callback) {
		console.log("login");
		
		var loginAPI = "http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetAuthUserData_v2";
		
		$http.post(loginAPI, { token: username })
				.success(function (response) {
					console.log(response);
						// login successful if there's a token in the response
			/*
						if (response.token) {
								// store username and token in local storage to keep user logged in between page refreshes
								$localStorage.currentUser = { username: username, token: response.token };

								// add jwt token to auth header for all requests made by the $http service
								$http.defaults.headers.common.Authorization = 'Bearer ' + response.token;

								// execute callback with true to indicate successful login
								callback(true);
						} else {
								// execute callback with false to indicate failed login
								callback(false);
						}
						*/
				});
	}

	function Logout() {
			// remove user from local storage and clear http auth header
			delete $localStorage.currentUser;
			$http.defaults.headers.common.Authorization = '';
	}	
	
})

.factory('Help', function () {
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

		//retrieve menu data 
		all: function () {
			return faqs;
		},
		get: function (faqId) {
			for (var i = 0; i < faqs.length; i++) {
				if (faqs[i].id === parseInt(faqId)) {
					return faqs[i];
				}
			}
			return null;
		},
		submitBugReport: function () {
			//submit bug report here		 
		}

	};

});

var CollegeChefs = CollegeChefs || {};

CollegeChefs.helpers = {
	goToTodaysMeals: function ($state, $ionicViewSwitcher) {
		$ionicViewSwitcher.nextDirection('forward');
		$state.go('tab.meal', {
			menuId: 1
		});
	},
	getUserID: function ($ionicUser) {
		if (ionic.Platform.is('browser')) {
			return 2570;
		} else {
			return $ionicUser.get('dnnuserid');
		}

	}
};