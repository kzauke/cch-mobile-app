angular.module('collegeChefs.controllers', ['ionic.cloud'])




/*********** Meals / Menus ***********/
/*************************************/

.controller('MenusCtrl', function ($scope, Globals, Account, Menus, $state, $ionicViewSwitcher, $stateParams, $ionicScrollDelegate, $location, $anchorScroll, $ionicPlatform, $ionicLoading, $ionicModal, $window, $timeout) {

	$scope.index = Number($stateParams.menuId);

	var noItemsMessage = '<i class="padding icon icon-strawberry assertive no-items-icon"></i><p>There is no meal data available.<br />Please try back later.</p>';

  var userInfo = Account.getUserInfo();
  var userId = userInfo.id;

  console.log("userId: " + userId);

  console.log("Call Menus.getAll()");
	var getMealListings = Menus.getAll(userId);
	var modalTemplate;

	$scope.noItems = "";


	// Init
	$ionicPlatform.ready(function () {
		getMealListingsData();

	});
	$ionicPlatform.on('resume', function () {
		$window.location.reload();
	});

	// Init Get Meal
	if ($stateParams.menuId !== undefined) {
		getMealListings.then(
			function (response) {
				var menus = response.data;
				var menuid = $stateParams.menuId;

				for (var i = 0; i < menus.length; i++) {
					if (menuid === "next") {
						if (!$scope.mealHasPassed(menus[i].name, menus[i].date)) {
							$scope.meal = menus[i];
							$scope.index = i;
							break;
						}
					} else if ($scope.index === i) {
						$scope.meal = menus[i];

						break;
					}
				}
				setTimeout(function () {
					if (!$scope.meal) {
						$scope.noItems = noItemsMessage;
					}
				}, 500)
			},
			function (error) {
				$scope.noItems = noItemsMessage;
				console.log('error', error);
			});
	}

	$scope.icon = function (mealType) {
		return Menus.getIcon(mealType);
	};

	$scope.getFormattedDate = function (mealDate) {
		return Globals.getFormattedDate(mealDate);
	};
	$scope.mealIsToday = function (mealDate) {
		var d1 = new Date();
		var d2 = new Date(mealDate);
		return Globals.isDateSame(d1, d2);
	};
	$scope.mealHasPassed = function (mealType, mealDate) {
		return Menus.mealHasPassed(mealType, mealDate);
	};
	$scope.goForward = function (toState) {
		Globals.goForward($state, toState, $ionicViewSwitcher, $stateParams);
	};
	$scope.dataLoaded = false;
	$scope.showLatePlateButton = function (mealHasPassed, mealIsToday, mealType) {
		return Menus.showLatePlateButton(mealHasPassed, mealIsToday, mealType);
	};
	$scope.getLatePlateMsg = function (mealType, mealIsToday) {
		return Menus.getLatePlateMsg(mealType, mealIsToday);
	};

	//Next / Previous Meal functionality
	$scope.goNext = function () {
		Menus.goNext($scope.index, $state, $ionicViewSwitcher);
	};
	$scope.goBack = function () {
		Menus.goBack($scope.index, $state, $ionicViewSwitcher);
	};

	$scope.openModal = function (action) {
		if (action == "create") {
			modalTemplate = "templates/modal-confirm-late-plate.html";
		} else if (action == "delete") {
			modalTemplate = "templates/modal-cancel-late-plate.html";
		}
		$scope.modal.show();
	};

	//request late plate modal
	$ionicModal.fromTemplateUrl('templates/modal-confirm-late-plate.html', {
		id: '1',
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (modal) {
		$scope.oModal1 = modal;
	});

	// Cancel late plate modal
	$ionicModal.fromTemplateUrl('templates/modal-cancel-late-plate.html', {
		id: '2',
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (modal) {
		$scope.oModal2 = modal;
	});

	$scope.openModal = function (action) {
		if (action == 'create') $scope.oModal1.show(); //on create
		else $scope.oModal2.show(); //on delete
	};

	$scope.closeModal = function (action) {
		if (action == 'create') $scope.oModal1.hide();
		else $scope.oModal2.hide();
	};


	$scope.requestLatePlate = function (mealId) {
		Menus.requestLatePlate($scope, mealId);
	};

	$scope.cancelLatePlate = function (mealId) {
		Menus.cancelLatePlate($scope, mealId);
	};

	function getMealListingsData() {

		$ionicLoading.show({
			template: '<ion-spinner class="spinner-assertive" icon="ripple"></ion-spinner>',
		});


		getMealListings.then(
			function (response) {

				$scope.menus = response.data;
				$scope.mealCount = response.data.length;
				if (response.data.length > 0) {
					$scope.noItems = "";
					$location.hash('today');
				} else {
					$scope.noItems = noItemsMessage;
				}

				$scope.dataLoaded = true;
				$ionicLoading.hide();
			},
			function (error) {
				$ionicLoading.hide();

			});

		//don't let the ionic loading wheel hang
		$timeout(function () {
			$ionicLoading.hide();
		}, 3000);
	}
})

.controller('ReviewsCtrl', function ($scope, Globals, Menus) {
	var getMealListings = Menus.getAll();

	$scope.icon = function (mealType) {
		return Menus.getIcon(mealType);
	};

	$scope.mealIsToday = function (mealDate) {
		var d1 = new Date();
		var d2 = new Date(mealDate);
		return Globals.isDateSame(d1, d2);
	};
	$scope.getFormattedDate = function (mealDate) {
		return Globals.getFormattedDate(mealDate);
	};
	getMealListings.then(
		function (response) {
			$scope.menus = response.data;
		},
		function (error) {
			console.log('error', error);
		});
})




/*********** Welcome / Login Screens ***********/
/***********************************************/

.controller('WelcomeCtrl', function ($scope, $state, Account, $ionicViewSwitcher) {
	$scope.authenticateUser = function (method) {
		Account.authenticateUser($state, method, $ionicViewSwitcher);
	};
})

.controller('LoginCtrl', function ($location, AuthenticationService, $state) {

	var vm = this;
	vm.login = login;

	function login() {
		vm.loading = true;

		AuthenticationService.Login(vm.username, vm.password, function (result) {
			if (result === true) {
				$location.path('/tab/meal/next');
			} else {
				vm.error = 'There was an error logging you in. Please check your username or password and try again.';
				vm.loading = false;
			}
		});
	}
})

.controller('RegisterCtrl', function ($scope, $state, Account, $ionicViewSwitcher, $location, $q) {

	$scope.backToWelcome = function () {
		Account.backToWelcome($state, $ionicViewSwitcher);
	};

	$scope.registerMessage = "No Error Message Yet";

	$scope.registerUser = function (user, method) {

		var loginData = {
			'email': user.email,
			'firstname': user.firstname,
			'lastname': user.lastname,
			'activation': user.activation
		};
		$scope.registerMessage = Account.registerUser($state, $ionicViewSwitcher, method, loginData, $location, $q);
	};
})

.controller('ActivationCtrl', function ($scope, $state, Account) {})

.controller('RequestActivationCtrl', function ($scope, $state, Account, $ionicViewSwitcher) {
	$scope.backToWelcome = function () {
		Account.backToWelcome($state, $ionicViewSwitcher);
	};
	$scope.requestActivation = function () {
		Account.requestActivation($state, $ionicViewSwitcher);
	}
})

.controller('ForgotPasswordCtrl', function ($scope, $state, Account, $ionicViewSwitcher) {
	$scope.backToWelcome = function () {
		Account.backToWelcome($state, $ionicViewSwitcher);
	};
	$scope.newPasswordRequest = function () {
		Account.newPasswordRequest($state, $ionicViewSwitcher);
	}
})




/*********** Account Tab ***********/
/*************************************/

.controller('AccountCtrl', function ($scope, Account, $state, $ionicViewSwitcher, $timeout, $ionicHistory) {

	$scope.userInfo = Account.getUserInfo();
	$scope.logout = function() {
		Account.logout($state, $ionicViewSwitcher);
    $timeout(function() {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      console.log("Clear cache and history");
    }, 150);
	};
})

.controller('ContactUsCtrl', function ($scope) {})

//
// Note: The `EditProfileCtrl` is not being used and duplicates `AccountCtrl`,
//       so I reassigned "tab.profile" Controller in `app.js`. -CML
// ----------------------------------------------------------------------------

// .controller('EditProfileCtrl', function ($scope, Account, $state) {
// 	$scope.userInfo = Account.getUserInfo();
// 	$scope.updateProfile = function () {
// 		Account.updateProfile($state);
// 	};
// })

.controller('PasswordCtrl', function ($scope, Account, $state) {
	$scope.updatePassword = function () {
		Account.updatePassword($state);
	}
})

.controller('HelpCtrl', function ($scope, Help) {
	$scope.faqs = Help.all();
})

.controller('HelpDetailCtrl', function ($scope, $stateParams, Help) {
	$scope.faq = Help.get($stateParams.faqId);

})

.controller('ReportBugCtrl', function ($scope, $state, Help) {
	$scope.submitBugReport = function () {
		Help.submitBugReport($state);
	};
})
