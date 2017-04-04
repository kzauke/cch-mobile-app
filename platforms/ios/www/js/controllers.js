angular.module('collegeChefs.controllers', ['ionic.cloud'])

/*********** Meals / Menus ***********/
/*************************************/


.controller('MenusCtrl', function($scope, Globals, Menus, $state, $ionicViewSwitcher, $stateParams, $ionicScrollDelegate, $location, $anchorScroll,$ionicPlatform,$ionicLoading) {
	
	//upon load view, make sure we scroll to today
	$location.hash('today');
	$ionicScrollDelegate.anchorScroll(true);

	var getMealListings = Menus.getAll();
	
	function getMealListingsData() {
		
		getMealListings.then(
			 function(response) { 
				  $scope.menus = response.data;
				  
				  console.log($location.hash());
				  $ionicScrollDelegate.anchorScroll(true);

			 },
			 function(error) {
				  console.log('error', error);
			 });
			 

	}
	
	 
	$ionicPlatform.on('resume', function(){
		getMealListingsData();
	});
	$ionicPlatform.ready(function(){
		getMealListingsData();
	});
	
	$scope.doRefresh = function(){
		Menus.doRefresh();
	};

	$scope.icon = function(mealType) {
		return Menus.getIcon(mealType);
	};
	
	$scope.getFormattedDate = function(mealDate) {
		return Globals.getFormattedDate(mealDate);
	}; 
	
	$scope.getLatePlateMsg = function(mealType, mealIsToday) {
		return Menus.getLatePlateMsg(mealType, mealIsToday);
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
  
})

.controller('MealCtrl', function($scope, $stateParams, Menus, LatePlate, Globals, $state, $ionicViewSwitcher, $ionicModal, $ionicLoading) {
	
	
	$scope.index = Number($stateParams.menuId);
	
	var getMealListings = Menus.getAll();

	$scope.mealIsToday = function(mealDate) {
		var d1 = new Date();
		var d2 = new Date(mealDate);
		return Globals.isDateSame(d1, d2);
	};
	
	$scope.mealHasPassed = function(mealType, mealDate) {
		return Menus.mealHasPassed(mealType, mealDate);	
	};
	
	$scope.showLatePlateButton = function(mealHasPassed, mealIsToday) {
		return Menus.showLatePlateButton(mealHasPassed, mealIsToday);
	};

	$scope.getLatePlateMsg = function(mealType, mealIsToday) {
		return Menus.getLatePlateMsg(mealType, mealIsToday);
	};

	$scope.getFormattedDate = function(mealDate) {
		return Globals.getFormattedDate(mealDate);
	};	
	
	//get next meal if menuid is next, otherwise get menu id indicated
	if ($stateParams.menuId === "next") {
		getMealListings.then(
		 function(response) { 
		 	var menus = response.data;
		 	for (var i = 0; i < menus.length; i++) {
        		if (!$scope.mealHasPassed(menus[i].name, menus[i].date)) {
          		$scope.index = menus[i].id;
					break;
        		}
			}
		 },
		 function(error) {
			  console.log('error', error);
		 });
	}
	
	$ionicLoading.show({
		template: '<ion-spinner class="spinner-assertive" icon="ripple"></ion-spinner>',
	});
	$scope.dataLoaded = false;
	
	getMealListings.then(
		 function(response) { 
		 	var menus = response.data;
			$scope.mealCount = response.data.length;
			  for (var i = 0; i < menus.length; i++) {
        		if (menus[i].id == $scope.index) {
          		$scope.meal = menus[i];
					break;
        		}
      	}
			$ionicLoading.hide();
			$scope.dataLoaded = true;
		 },
		 function(error) {
			  console.log('error', error);
		 });
	


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
	
	$scope.requestLatePlate = function(){
		LatePlate.requestLatePlate($scope);
	};
	
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

.controller('LoginCtrl', function($scope, $state, Account, $ionicViewSwitcher, $ionicAuth, $ionicUser,$location) {
	$scope.backToWelcome = function() {
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};	
	$scope.authenticateUser = function(email, password, method) {
		var loginData = {'username': email, 'password': password};
		Account.authenticateUser($state, $ionicViewSwitcher, method, loginData,$location);	
		console.log($ionicAuth.isAuthenticated());
	};	
})

.controller('RegisterCtrl', function($scope, $state, Account, $ionicViewSwitcher) {
	$scope.backToWelcome = function() {
		Account.backToWelcome($state, $ionicViewSwitcher)	;
	};
	$scope.registerUser = function(user, method) {
		var loginData = {'id': user.email, 'name': user.name, 'activation':user.activation };

		Account.registerUser($state, $ionicViewSwitcher, method, loginData);	
	}
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
