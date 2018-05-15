angular.module('collegeChefs.controllers', ['ionic.cloud'])




/*********** Meals / Menus ***********/
/*************************************/

.controller('MenusCtrl', function ($scope, Account, Globals, Menus, $state, $ionicViewSwitcher, $stateParams, $ionicScrollDelegate, $location, $anchorScroll, $ionicPlatform, $ionicLoading, $ionicModal, $window, $timeout) {
  // console.log("MenusCtrl is initialized");

  $scope.index = Number($stateParams.menuId);

  var noItemsMessage = '<i class="padding icon icon-strawberry assertive no-items-icon"></i><p>There is no meal data available.<br />Please try back later.</p>';

  $scope.getMealListings = Account.getUser().then(
    function(response) {
      $scope.userInfo = Account.getUserInfo(response);
      return Menus.getMealData($scope.userInfo.id);
    },
    function(error) {
      console.log("Unable to get `userInfo` object");
    }
  );

  var modalTemplate;

  $scope.noItems = "";

  // Init
  $ionicPlatform.ready(function() {
    getMealListingsData();
  });

  $ionicPlatform.on('resume', function() {
    $window.location.reload();
  });

  // Init Get Meal
  if ($stateParams.menuId !== undefined) {
    $scope.getMealListings.then(
      function(response) {
        var menus = response.data;
        var menuId = $stateParams.menuId;

        for (var i = 0; i < menus.length; i++) {
          if (menuId === "next") {
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
        setTimeout(function() {
          if (!$scope.meal) {
            $scope.noItems = noItemsMessage;
          }
        }, 500)
      },
      function(error) {
        $scope.noItems = noItemsMessage;
        // console.log('error', error);
      }
    );
  }

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

  $scope.showLatePlateButton = function(mealType, mealDate) {
    return Menus.showLatePlateButton(mealType, mealDate);
  };

  $scope.latePlateDeadlineHasPassed = function(mealType, mealIsToday) {
    return Menus.latePlateDeadlineHasPassed(mealType, mealIsToday);
  };

  $scope.getLatePlateMsg = function(mealType, mealIsToday, showIcon) {
    return Menus.getLatePlateMsg(mealType, mealIsToday, showIcon);
  };

  // Next meal
  $scope.goNext = function() {
    Menus.goNext($scope.index, $state, $ionicViewSwitcher);
  };

  // Previous meal
  $scope.goBack = function() {
    Menus.goBack($scope.index, $state, $ionicViewSwitcher);
  };

  // request late plate modal
  $ionicModal.fromTemplateUrl('templates/modals/late-plate-confirm.html', {
    id: '1', // pass the id into the function in the view to trigger this modal
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConfirm = modal;
  });

  // Cancel late plate modal
  $ionicModal.fromTemplateUrl('templates/modals/late-plate-cancel.html', {
    id: '2', // pass the id into the function in the view to trigger this modal
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalCancel = modal;
  });

  $scope.openModal = function(index) {
    if (index === 1) $scope.modalConfirm.show();
    else $scope.modalCancel.show();
  };

  $scope.closeModal = function(index) {
    if (index === 1) $scope.modalConfirm.hide();
    else $scope.modalCancel.hide();
  };

  $scope.requestLatePlate = function(mealId) {
    Menus.requestLatePlate($scope, mealId).then(
      function(response) {
        $window.location.reload();
      },
      function(error) {
        console.log(error);
      }
    );
  };

  $scope.cancelLatePlate = function(mealId) {
    Menus.cancelLatePlate($scope, mealId).then(
      function(response) {
        $window.location.reload();
      },
      function(error) {
        console.log(error);
      }
    );
  };

  function getMealListingsData() {

    $ionicLoading.show({
      template: '<ion-spinner class="spinner-assertive" icon="ripple"></ion-spinner>',
    });

    $scope.getMealListings.then(
      function(response) {
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
      function(error) {
        $ionicLoading.hide();
      }
    );

    // don't let the ionic loading wheel hang
    $timeout(function() {
      $ionicLoading.hide();
    }, 3000);
  }
})

// .controller('ReviewsCtrl', function ($scope, Globals, Menus) {
// 	var getMealListings = Menus.getAll();

// 	$scope.icon = function (mealType) {
// 		return Menus.getIcon(mealType);
// 	};

// 	$scope.mealIsToday = function (mealDate) {
// 		var d1 = new Date();
// 		var d2 = new Date(mealDate);
// 		return Globals.isDateSame(d1, d2);
// 	};
// 	$scope.getFormattedDate = function (mealDate) {
// 		return Globals.getFormattedDate(mealDate);
// 	};
// 	getMealListings.then(
// 		function (response) {
// 			$scope.menus = response.data;
// 		},
// 		function (error) {
// 			console.log('error', error);
// 		});
// })




/*********** Welcome / Login Screens ***********/
/***********************************************/

// .controller('WelcomeCtrl', function($scope, $state, Account, $ionicViewSwitcher) {
// 	$scope.authenticateUser = function(method) {
// 		Account.authenticateUser($state, method, $ionicViewSwitcher);
// 	};
// })

.controller('LoginCtrl', function ($scope, $location, $sqliteService, AuthenticationService, $ionicPlatform, $cordovaAppVersion) {
  // console.log("LoginCtrl initialized");

  // Load the database, true = debug
  $sqliteService.loadDatabase(false);

  var vm = this;
  vm.formSubmit = formSubmit;
  vm.loginAssistance = loginAssistance;

  vm.version = null;

  $ionicPlatform.ready(function() {
    $cordovaAppVersion.getVersionNumber().then(function(version) {
      vm.version = version;
    });
  });

  function loginAssistance() {
    var url = "http://chefnet.collegechefs.com/tabid/395";

    if (vm.email !== undefined) {
      url += /uid/ + vm.email;
    }

    window.open(url, '_system', 'location=no');
    return false;
  };

  function formSubmit() {
    AuthenticationService.login(vm.username, vm.password, function(result) {
      if (result === true) {
        $location.path('/tab/meal/next');
      } else {
        vm.error = 'There was an error logging you in. Please check your username or password and try again.';
      }
    });
  }
})

.controller('RegisterCtrl', function ($scope, $location, Account, AuthenticationService, $state, $ionicViewSwitcher) {

	$scope.registerUser = function (user, method) {

		var loginData = {
			'email': user.email,
			'firstname': user.firstname,
			'lastname': user.lastname,
			'activation': user.activation
		};

    Account.registerUser(loginData).then(function(result) {
      if (result.error) {
        $scope.registerMessage = Account.getRegistrationError(result.error);
      } else if (result.token) {

        var _token = jwt_decode(result.token);

        AuthenticationService.login(_token.username, _token.password, function(result) {
          if (result === true) {
            $location.path('/tab/meal/next');
          } else {
            $scope.registerMessage = 'There was an error logging you in. Please check your username or password and try again.';
          }
        })
      }
    });
	};

  $scope.backToWelcome = function () {
    Account.backToWelcome($state, $ionicViewSwitcher);
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

.controller('AccountCtrl', function ($scope, Account, $state, $ionicViewSwitcher, $ionicPlatform, $cordovaAppVersion, $timeout, $ionicHistory) {
  // console.log("AccountCtrl initialized");

  Account.getUser().then(
    function(success) {
      $scope.userInfo = Account.getUserInfo(success);
    },
    function(error) {
      console.log("Unable to get `userInfo` object");
    }
  );

  $scope.version = null;

  $ionicPlatform.ready(function() {
    $cordovaAppVersion.getVersionNumber().then(function(version) {
      $scope.version = version;
    });
  });

  $scope.logout = function() {
    Account.logout($state, $ionicViewSwitcher);
    $timeout(function() {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
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
});
