angular.module('collegeChefs.services', ['ionic.cloud'])

//go back to oos inventory to clean this up

.factory('Menus', function($http,$ionicLoading) {
 
 	var userid = CollegeChefs.helpers.getUserID();
   //make sure items come out of database in sequential order
   var dataSource = 'http://chefnet.collegechefs.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=GetMeals&UserID=' + userid;
	
	//24 hour clock
	var lunchLPEndTime = 10;			//no lunch late plate orders after 10am
	var dinnerLPEndTime = 15;			//no dinner late plate orders after 3pm
	var afterDinnerLPEndTime = 20;	//dinner ends after 8pm
	 
	 
  return {
	  
	 //retrieve menu data 
    getAll: function() {

		 return $http.get(dataSource,{ cache: true});
    },
	 getTodaysFirstMealIndex: function() {
		//return 8; 
	 },
	 getLatePlateMsg: function(mealType, mealIsToday) {
		 if (mealIsToday) {
			 var latePlateString = "<span class='ion-android-time'></span> Late plate orders due by ";
			 
			 var lunchEnd = lunchLPEndTime + " a.m. today";
			 var dinnerEnd = (dinnerLPEndTime - 12) + " p.m. today";
			 
			 switch (mealType) {
				case "Lunch" :
					return latePlateString + lunchEnd;
				case "Dinner" :
					return latePlateString + dinnerEnd;
			}
			return null;
		}
	 },
	 
	 getIcon: function(mealType) {
		switch (mealType) {
			case "Breakfast" :
				return "img/menu-breakfast.png";
			case "Lunch" :
				return "img/menu-lunch.png";
			case "Dinner" :
				return "img/menu-dinner.png";
		}
	 },
	 
	 mealHasPassed: function(mealType, mealDate) {
		 
		 var today = new Date();
		 today.setHours(0,0,0,0);
		 
		 var mealDateTime = new Date(mealDate);
		 mealDateTime.setHours(0,0,0,0);
		 

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
	 
	 showLatePlateButton: function(mealHasPassed) {
		 //when do we show late plate button?
		 //if meal has passed already - false
		 //if meal is after cutoff - false
		 //if lp is already requested - false
		 if (mealHasPassed) {
		 	return false;
		 }
		 return true;
	 },
	
	 //navigate menu data
	 goNext: function($index, $state, $ionicViewSwitcher) {
		$ionicViewSwitcher.nextDirection('forward');
		var nextIndex = Number($index) + 1;
		$state.go('tab.meal', { menuId: nextIndex });
	 },
	 
	 goBack: function($index, $state, $ionicViewSwitcher) {
		$ionicViewSwitcher.nextDirection('back');
		var prevIndex = Number($index) - 1;
		$state.go('tab.meal', { menuId: prevIndex });
	 }
	 
  };
})

.factory('LatePlate', function() { 
	return {
		 //late plate request 
       requestLatePlate: function($scope) {
			 
			 //submit late plate request to DB (using $http.post()?)
			 //https://lostechies.com/gabrielschenker/2013/12/17/angularjspart-5-pushing-data-to-the-server/
			 console.log("submit late Plate");
			 
			 //do we get the data again to make sure that "is ordered" message is accurate?
			 //hide the button, add 'order requested' message / should happen automatically when data is refreshed?
	
			 // close the modal	 
			 $scope.modal.hide();
	 	}
	};
})

.factory('Account', function($http, $ionicAuth, $ionicUser) {
	
	//get user data from DB
	
 		
	return {
	 getUserInfo: function() {
		 
		 var userInfo = {
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
	 updateProfile: function($state) {
		 //submit new user data to DB, refresh data
		 //http://www.nikola-breznjak.com/blog/codeproject/posting-data-from-ionic-app-to-php-server/
		console.log('profile saved'); 
		$state.go('tab.account');
	 },
	 
	 updatePassword: function($state) {
		 //submit new user data to DB, refresh data
		 //http://www.nikola-breznjak.com/blog/codeproject/posting-data-from-ionic-app-to-php-server/
		console.log('password saved'); 
		$state.go('tab.account');
	 },
	 
	 registerUser: function($state, $ionicViewSwitcher, method, loginData) {
		 
		 
		console.log(loginData);
		//$ionicViewSwitcher.nextDirection('forward');		 
		//$state.go('tab.meal', { menuId: 1 });
	 },
	 
	 requestActivation: function($state, $ionicViewSwitcher) {
		$ionicViewSwitcher.nextDirection('back');		 
		console.log("request activation");
		$state.go('register');

	 },
	 backToWelcome: function($state, $ionicViewSwitcher) {
		$ionicViewSwitcher.nextDirection('back');
		$state.go('welcome');
	 },
	 
	 newPasswordRequest: function($state) {
		console.log('password request');
		$state.go('login');
	 },
	 authenticateUser: function($state, $ionicViewSwitcher, method, loginData,$location) {
		
		if (method === 'chefnet') {
			var loginOptions = {'inAppBrowserOptions': {'hidden': true}};
			
			$ionicAuth.login('custom', loginData, loginOptions).then(function(s) {
					console.log(s);
					$location.path('/tab/meal/next');
				}, function(e) {
					console.log(e);	
				}
			);
		 }
		 
		 
		 
		 //CollegeChefs.helpers.goToTodaysMeals($state, $ionicViewSwitcher);
		 
	 },
	 logoff: function($state, $ionicViewSwitcher) {
		$ionicAuth.logout();
		$ionicViewSwitcher.nextDirection('forward');		 
		$state.go('welcome');
	 }
  };
})
 
.factory('Globals',function() {
	return {
		backButton: function($ionicHistory) {
			$ionicHistory.goBack();	
		},
		goForward: function($state, toState, $ionicViewSwitcher, params) {
			console.log('something something');
			$ionicViewSwitcher.nextDirection('forward');		 
			$state.go(toState,params);
		},
		isDateSame: function(d1, d2) {
			d1 = new Date(d1);
			d1.setHours(0,0,0,0);
			d2 = new Date(d2);
			d2.setHours(0,0,0,0);
			return (d1.getUTCDate() === d2.getUTCDate());		
		},
		getFormattedDate: function(date) {
			date = new Date(date);
			
			var weekday = new Array(7);
			weekday[0]=  "Sun";
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
			return weekday[date.getUTCDay()] + ", " + month[date.getUTCMonth()] + " " + date.getUTCDate();
		},
	};
})

.factory('Help',function() {
	var faqs = [
	  {
		 id: 1,
		 question: 'Why is the sky blue?',
		 answer: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tristique felis, vel viverra sapien. Donec dignissim consequat interdum. Etiam nibh massa, rhoncus a semper ac, feugiat sit amet tortor.</p><p>Nulla facilisi. Sed pulvinar, nunc pretium tristique faucibus, odio urna commodo eros, nec luctus velit metus sit amet elit. Aenean laoreet ullamcorper dui a lacinia. Nam in ex eget tellus aliquet fringilla. Vestibulum dapibus id nisi eu eleifend. Sed id libero auctor, lobortis nisi vel, finibus nulla.</p>'
	  		},
			{
		 id: 2,
		 question: 'Why is blood red?',
		 answer: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tristique felis, vel viverra sapien. Donec dignissim consequat interdum. Etiam nibh massa, rhoncus a semper ac, feugiat sit amet tortor.</p><p>Nulla facilisi. Sed pulvinar, nunc pretium tristique faucibus, odio urna commodo eros, nec luctus velit metus sit amet elit. Aenean laoreet ullamcorper dui a lacinia. Nam in ex eget tellus aliquet fringilla. Vestibulum dapibus id nisi eu eleifend. Sed id libero auctor, lobortis nisi vel, finibus nulla.</p>'
		},
		{
		 id: 3,
		 question: 'What\'s for dinner?',
		 answer: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tristique felis, vel viverra sapien. Donec dignissim consequat interdum. Etiam nibh massa, rhoncus a semper ac, feugiat sit amet tortor.</p><p>Nulla facilisi. Sed pulvinar, nunc pretium tristique faucibus, odio urna commodo eros, nec luctus velit metus sit amet elit. Aenean laoreet ullamcorper dui a lacinia. Nam in ex eget tellus aliquet fringilla. Vestibulum dapibus id nisi eu eleifend. Sed id libero auctor, lobortis nisi vel, finibus nulla.</p>'
		},
		{
		 id: 4,
		 question: 'How many pennies are in a dollar?',
		 answer: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis tristique felis, vel viverra sapien. Donec dignissim consequat interdum. Etiam nibh massa, rhoncus a semper ac, feugiat sit amet tortor.</p><p>Nulla facilisi. Sed pulvinar, nunc pretium tristique faucibus, odio urna commodo eros, nec luctus velit metus sit amet elit. Aenean laoreet ullamcorper dui a lacinia. Nam in ex eget tellus aliquet fringilla. Vestibulum dapibus id nisi eu eleifend. Sed id libero auctor, lobortis nisi vel, finibus nulla.</p>'
	  }
	];
	
	 return {
	  
	 //retrieve menu data 
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
		//submit bug report here		 
	 }
	 
  };

});

var CollegeChefs = CollegeChefs || {};

CollegeChefs.helpers = {
   goToTodaysMeals: function($state, $ionicViewSwitcher) {
			$ionicViewSwitcher.nextDirection('forward');		 
			$state.go('tab.meal', { menuId: 1 });
	},
	getUserID: function() {
		return 2452;
	}
 };
