angular.module('collegeChefs.controllers', ['ionic.cloud'])

/*********** Meals / Menus ***********/
/*************************************/


.controller('MenusCtrl', function($scope, Globals, Menus, $state, $ionicViewSwitcher, $stateParams, $ionicScrollDelegate, $location, $anchorScroll,$ionicPlatform,$ionicLoading,$ionicModal,$window,$timeout) {
	$scope.index = Number($stateParams.menuId);

	var getMealListings = Menus.getAll();
	
	//Init
	$ionicPlatform.ready(function(){
		console.log('ready');
		getMealListingsData();
		
		//upon load view, make sure we scroll to today
		$location.hash('today');
		
	});
	$ionicPlatform.on('resume', function(){
		$window.location.reload();
		$location.hash('today');
	}); 
	
	//Init Get Meal
	if ($stateParams.menuId !== undefined) {
		getMealListings.then(
		 function(response) { 
		 	var menus = response.data;
			var menuid = $stateParams.menuId;
			
			for (var i = 0; i < menus.length; i++) {
				if (menuid === "next") {
					if (!$scope.mealHasPassed(menus[i].name, menus[i].date)) {
						$scope.meal = menus[i];
                        $scope.index = i
						break;
					}
				}
				else if ($scope.index === i) {
          		$scope.meal = menus[i];
					break;
        		}
			}
		 },
		 function(error) {
			  console.log('error', error);
		 });
	}

	$scope.noItems = '<i class="padding icon icon-strawberry assertive no-items-icon"></i><p>There is no meal data available.<br />Please try back later.</p>';
	$scope.icon = function(mealType) {
		return Menus.getIcon(mealType);
	};	
	$scope.getFormattedDate = function(mealDate) {
		return Globals.getFormattedDate(mealDate);
	}; 
	$scope.mealIsToday = function(mealDate) {
		var d1 = new Date();
		var d2 = new Date(mealDate);
		return Globals.isDateSame(d1, d2);
	};
	$scope.mealHasPassed = function(mealType, mealDate) {
		return Menus.mealHasPassed(mealType, mealDate);	
	};
	$scope.goForward = function(toState) {
		Globals.goForward($state, toState, $ionicViewSwitcher, $stateParams);
	};
	$scope.dataLoaded = false;
	$scope.showLatePlateButton = function(mealHasPassed, mealIsToday, mealType) {
		return Menus.showLatePlateButton(mealHasPassed, mealIsToday, mealType);
	};
	$scope.getLatePlateMsg = function(mealType, mealIsToday) {
		return Menus.getLatePlateMsg(mealType, mealIsToday);
	};
	
	//Next / Previous Meal functionality
	$scope.goNext = function() {
		Menus.goNext($scope.index, $state, $ionicViewSwitcher);	
	};
	$scope.goBack = function() {
		Menus.goBack($scope.index, $state, $ionicViewSwitcher);	
	};

	//Late Plate
	$ionicModal.fromTemplateUrl('templates/modal-confirm-late-plate.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	
	$scope.requestLatePlate = function(mealId){
		Menus.requestLatePlate($scope, mealId);
	};

	function getMealListingsData() {
		$ionicLoading.show({
			template: '<ion-spinner class="spinner-assertive" icon="ripple"></ion-spinner>',
		});
		
		
		getMealListings.then(
		 function(response) { 
			$scope.menus = response.data;
			$scope.mealCount = response.data.length;
			if (response.data.length > 0) {
				$scope.noItems = "";
			}
			$scope.dataLoaded = true;
			$ionicLoading.hide();
		 },
		 function(error) {
			  console.log('error', error);
				$ionicLoading.hide();

		 });
		 
		 //don't let the ionic loading wheel hang
		$timeout(function() {
			$ionicLoading.hide();	 
		}, 3000);
	}
	
})

.controller('ReviewsCtrl', function($scope, Globals, Menus) {
	var getMealListings = Menus.getAll();
	
	$scope.icon = function(mealType) {
		return Menus.getIcon(mealType);
	};

	$scope.mealIsToday = function(mealDate) {
		var d1 = new Date();
		var d2 = new Date(mealDate);
		return Globals.isDateSame(d1, d2);
	};
	$scope.getFormattedDate = function(mealDate) {
		return Globals.getFormattedDate(mealDate);
	};
	getMealListings.then(
		 function(response) { 
			  $scope.menus = response.data;
		 },
		 function(error) {
			  console.log('error', error);
		 });
})

/*********** Welcome / Login Screens ***********/
/***********************************************/

.controller('WelcomeCtrl', function($scope, $state, Account, $ionicViewSwitcher) {
	$scope.authenticateUser = function(method) {
		Account.authenticateUser($state, method, $ionicViewSwitcher);	
	};	
})

.controller('LoginCtrl', function($scope, $state, Account, $ionicViewSwitcher, $ionicAuth, $ionicUser,$location,$timeout) {
	$scope.errorMsg = "";
	
	$scope.backToWelcome = function() {
		$timeout(function() {
			$scope.errorMsg = "";
		}, 10);
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};	
	$scope.authenticateUser = function(email, password, method) {
		var loginData = {'username': email, 'password': password};
		Account.authenticateUser($state, $ionicViewSwitcher, method, loginData,$location);	
		if (!$ionicAuth.isAuthenticated()) {
			$timeout(function() {
			$scope.errorMsg = "<h3>Oops, there was an error logging in.</h3><p>Please check your credentials and try again, or try the \"Forgot your password?\" link below</p>";
		}, 3000);
		}
		else {
			$scope.errorMsg = "";
		}
	};	
})

.controller('RegisterCtrl', function($scope, $state, Account, $ionicViewSwitcher,$location, $q) {
	
	$scope.backToWelcome = function() {
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};
	
	$scope.registerMessage = "No Error Message Yet";

	$scope.registerUser = function(user, method) {
		
		var loginData = {'email': user.email, 'firstname': user.firstname, 'lastname': user.lastname, 'activation':user.activation };
		$scope.registerMessage = Account.registerUser($state, $ionicViewSwitcher, method, loginData, $location, $q);	
	};
})

.controller('ActivationCtrl', function($scope, $state, Account) {})

.controller('RequestActivationCtrl', function($scope, $state, Account, $ionicViewSwitcher) {
	$scope.backToWelcome = function() {
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};
	$scope.requestActivation = function() {
		Account.requestActivation($state, $ionicViewSwitcher);	
	}
})

.controller('ForgotPasswordCtrl', function($scope, $state, Account, $ionicViewSwitcher) {
	$scope.backToWelcome = function() {
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};
	$scope.newPasswordRequest = function() {
		Account.newPasswordRequest($state, $ionicViewSwitcher);	
	}
})


/*********** Account Tab ***********/
/*************************************/

.controller('AccountCtrl', function($scope, Account, $state, $ionicViewSwitcher) {
   
	$scope.userInfo = Account.getUserInfo();
	$scope.logoff = function() {
		Account.logoff($state, $ionicViewSwitcher);	
	};
})

.controller('ContactUsCtrl', function($scope) {})

.controller('EditProfileCtrl', function($scope, Account, $state) {
	$scope.userInfo = Account.getUserInfo();	
	$scope.updateProfile = function() {
		Account.updateProfile($state);	
	};
})

.controller('PasswordCtrl', function($scope, Account, $state) {
	$scope.updatePassword = function() {
		Account.updatePassword($state);	
	}
})

.controller('HelpCtrl', function($scope, Help) {
  $scope.faqs = Help.all(); 
})

.controller('HelpDetailCtrl', function($scope, $stateParams, Help) {
  	$scope.faq = Help.get($stateParams.faqId);

})

.controller('ReportBugCtrl', function($scope, $state, Help) {
	$scope.submitBugReport = function() {
		Help.submitBugReport($state);	
	};
})
