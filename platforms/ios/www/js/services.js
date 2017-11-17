angular.module('collegeChefs.services', ['ionic.cloud'])

// clean up by reading this article
// http://stackoverflow.com/questions/30752841/how-to-call-other-functions-of-same-services-in-ionic-angular-js

.factory('$sqliteFactory', function($cordovaSQLite) {
	console.log("$sqliteFactory instantiated");

	var _db;

	return {
		db: function() {
			if (!_db) {
				// Instantiate SQLite database connection after platform is ready
				_db = $cordovaSQLite.openDB({ name: 'options.db', location: 'default' });
	    	// console.log("Opened the database");
			}

			return _db;
		},

		executeSql: function(query, parameters) {
			return $cordovaSQLite.execute(this.db(), query, parameters);
		}
	}
})

.factory('AuthenticationService', ['$http', '$sqliteFactory', function($http, $sqliteFactory, $cordovaSQLite, $state){
	console.log("AuthenticationService factory instantiated");

	return {
		Login: function (username, password, callback) {
			console.log("AuthenticationService.Login() started");
			var loginAPI = "http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetDNNAuthUserData";
			var config = { params: { username: username, password: password } };

			$http.get(loginAPI, config)
				.success(function(response) {

						// login successful if there's a token in the response
						if (response.token) {
							console.log("Login is successful");

							// add token to auth header for all requests made by $http service
							// $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;

							// create table in SQLite
							$sqliteFactory.executeSql('CREATE TABLE IF NOT EXISTS Session (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, token TEXT)')
								.then(function(result) {
										console.log("Table created successfully");
								}, function(error) {
										console.log("Error creating table: " + error.message);
								}
							);

							// store username and token in SQLite
							$sqliteFactory.executeSql('INSERT INTO Session (username, token) VALUES (?, ?)', [username, response.token])
								.then(function(result) {
										console.log("Session saved successfully");
								}, function(error) {
										console.log("Error saving to table: " + error.message);
								}
							);

							// execute callback with true to indicate successful login
							callback(true);
						} else {
							console.log(response);
							// execute callback with false to indicate failed login
							callback(false);
						}
				})
				.error(function(e) {
					callback(false);
					console.log(e);
				}
			);
		},

		// Logout: function () {
		// 	// remove user from local storage and clear http auth header
		// 	// delete $localStorage.currentUser;
		// 	// $http.defaults.headers.common.Authorization = '';

		// 	console.log("AuthenticationService.Logout() triggered");

		// 	$sqliteFactory.executeSql('DELETE FROM Session')
		// 		.then(function(result) {
		// 				console.log("Session rows deleted");
		// 		}, function(error) {
		// 				console.log("Error deleting from table: " + error.message);
		// 		}
		// 	);
		// }
	}
}])

.factory('Account', function ($sqliteFactory, $http, $ionicAuth) {
	console.log("Account factory instantiated");

	var _userInfo = {};

	return {
		getUserInfo: function () {
			if (_userInfo.id === undefined) {
				// get user data from db
				$sqliteFactory.executeSql('SELECT * FROM Session ORDER BY id DESC')
		    	.then(function(result) {
		    		console.log("Rows length: " + result.rows.length);
		    		if (result.rows.length > 0) {

			   			var decoded = jwt_decode(result.rows.item(0).token);

			   			_userInfo.id = decoded.user_id;
							_userInfo.username = decoded.custom.username;
							_userInfo.firstname = decoded.custom.firstname;
							_userInfo.lastname = decoded.custom.lastname;
							_userInfo.email = decoded.custom.email;
							_userInfo.house = decoded.custom.house;
							_userInfo.supervisor = decoded.custom.supervisor;
							_userInfo.chef = decoded.custom.chef;

							console.log("ID: " + _userInfo.id);
							console.log("User: " + _userInfo.username);
							console.log("Chef: " + _userInfo.chef);
							console.log("House: " + _userInfo.house);
		    		} else {
		    			console.log("No results found.");
		    		}
		    	}, function(error) {
		    		console.log("Error on loading: " + error.message);
		    	}
		    );
		  }

			return _userInfo;
		},

		updateProfile: function ($state) {
			// submit new user data to DB, refresh data
			console.log('profile saved');
			$state.go('tab.account');
		},

		updatePassword: function ($state) {
			// submit new user data to DB, refresh data
			console.log('password saved');
			$state.go('tab.account');
		},

		registerUser: function ($state, $ionicViewSwitcher, method, loginData, $location, $q) {
			var placeholder = {};
			var defer = $q.defer();

			// send registration data to custom handler that adds user to our system
			var registerURL = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=RegisterAppUser&firstname=' + loginData.firstname + '&lastname=' + loginData.lastname + '&email=' + loginData.email + '&activation=' + loginData.activation;

			var location = $location;

			$http.get(registerURL).then(
				function (response) {
					// if return message is an error
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
						// decode token
						var decoded = jwt_decode(expToken);
						console.log(decoded.username);
						// if valid, authenticate user with our custom login
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
							// else display error
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

		// logoff: function ($state, $ionicViewSwitcher) {
		// 	$ionicAuth.logout();
		// 	$ionicViewSwitcher.nextDirection('forward');
		// 	$state.go('login');
		// 	console.log("`Account.logoff()` triggered");
		// },

		logout: function ($state, $ionicViewSwitcher) {
			// remove user from local storage and clear http auth header
			// delete $localStorage.currentUser;
			// $http.defaults.headers.common.Authorization = '';

			console.log("Account.logout() triggered");

			$sqliteFactory.executeSql('DELETE FROM Session')
				.then(function(result) {
						console.log("Session rows deleted");
						$ionicViewSwitcher.nextDirection('forward');
						$state.go('login');
				}, function(error) {
						console.log("Error deleting from table: " + error.message);
				}
			);
		}
	};
})

.factory('Menus', function ($http, Account, $ionicLoading, $cacheFactory, $ionicUser, $window, $timeout) {
	console.log("Menus factory instantiated");
	var Menus = this;

	// var userid = CollegeChefs.helpers.getUserID($ionicUser);

	var userInfo = Account.getUserInfo();
	var userid = userInfo.id;

	console.log("userid: " + userid);

	var dataSource = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetMeals&UserID=' + userid;

	// 24 hour clock
	var lunchLPEndTime = 10; // no lunch late plate orders after 10am
	var dinnerLPEndTime = 15; // no dinner late plate orders after 3pm
	var afterDinnerLPEndTime = 20; // dinner ends after 8pm

	return {

		// late plate request
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

		// cancel late plate request
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

		// retrieve menu data
		getAll: function () {
			return $http.get(dataSource, {
				cache: true
			});
		},

		getTodaysFirstMealIndex: function () {
			// return 8;
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
			//default to false
			return false;
		},

		showLatePlateButton: function (mealHasPassed, mealType, mealIsToday) {

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

.factory('Globals', function () {
	console.log("Globals factory instantiated");

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

.factory('Help', function () {
	console.log("Help factory instantiated");

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
			// submit bug report here
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
			return 7501;
		} else {
			return $ionicUser.get('dnnuserid');
		}
	}
};
