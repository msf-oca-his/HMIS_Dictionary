/*------------------------------------------------------------------------------------
 List of contributors: https://github.com/MSFOCBA
 Please refer to the LICENSE.md and LICENSES-DEP.md for complete licenses.
 ------------------------------------------------------------------------------------*/

/*
 * 	@alias appModule.controller
 * 	@type {Controller}
 * 	@description Configures the appModule so it manages translations
 *	@todo
 */
appModule.controller('appSharedController', ['$scope', '$translate', '$state', '$location', '$stateParams', '$http', '$window', 'Config', function($scope, $translate, $state, $location, $stateParams, $http, $window, Config) {
        
    this.$route = $state;
    this.$location = $location;
    this.$routeParams = $stateParams;
    $scope.show_admin = false;
    
    console.log("appModule: Checking user's rights...");

    jQuery.ajax({
		url: dhisUrl + 'userGroups/' + Config.userGroupId + '.json?fields=name,id&paging=false',
		contentType: 'json',
		method: 'GET',
		dataType: 'json',
		async: false
	}).success(function(response) {

		var prepareObject = function(data) {
			var userObj = {value: data.name};
			userObj.object = {id: data.id, name: data.name};
			return userObj;
		};

		var admin = prepareObject(response);
		$scope.userAdminGroup = admin.value;
		if($scope.userAdminGroup) {
			console.log('appModule: Group of users authorised to administrate: ' + admin.value);
		} else {
			console.log('appModule: Group of users authorised to administrate has not been identified.');
		}
	}).fail(function() {
		console.log('appModule: Group of users authorised to administrate has not been defined yet, go to the admin panel!');
		if(!_.isEmpty(Config.userGroupId)){
			alert("UserGroupId: UserGroupId mentioned in the config not matching with id present in config");
			throw new Error("UserGroupId: UserGroupId mentioned in the config not matching with id present in config");
		}
		// $scope.show_admin = true;
		// window.location.href = '#/admin';
	});

	//Validating Custom Attribute
    if(Config.customAttributes && Config.customAttributes.hideOnDictionary){
        if(Config.customAttributes.hideOnDictionary.id && Config.customAttributes.hideOnDictionary.id !=""){
            jQuery.ajax({
                url: dhisUrl + 'attributes/' + Config.customAttributes.hideOnDictionary.id + '.json?fields=name,id&paging=false',
                contentType: 'json',
                method: 'GET',
                dataType: 'json',
                async: false
            }).fail(function() {
                if(!_.isEmpty(Config.userGroupId)){
                    alert("CustomAttributeId: CustomAttributeId mentioned in the config not matching with id present in config");
                    throw new Error("CustomAttributeId: CustomAttributeId mentioned in the config not matching with id present in config");
                }
            });
        } else {
            alert("HideOnDictionaryId: The specified UID is not exist in system. Please contact your administrator");
            throw new Error("HideOnDictionaryId: The specified UID is not exist in system.");
        }
    }
	/* For services list */
	jQuery.ajax({
		url: dhisUrl + 'organisationUnitGroupSets/' + Config.organisationGroupSetId + '.json?fields=name,id&paging=false',
		contentType: 'json',
		method: 'GET',
		dataType: 'json',
		async: false
	}).success(function(response) {
		var prepareObject = function(data) {
			var userObj = {value: data.id};
			userObj.object = {id: data.id, name: data.name};
			return userObj;
		};
		var servicelist = prepareObject(response);
		$scope.serviceSetUID = servicelist.value;
		if($scope.serviceSetUID) {
            $scope.show_dossiers = true;
			console.log('appModule: List of services taken from organisationUnitGroupSet: ' + servicelist.value);
		} else {
			console.log('appModule: organisationUnitGroupSet to take the list of services has not been defined yet, go to the admin panel!');
		}
	}).fail(function() {
		console.log('appModule: organisationUnitGroupSet to take the list of services has not been identified.');
	});

	/* For DS blacklist */	
    $scope.blacklist_datasets = Config.blackListDataSetsIds;
    if($scope.blacklist_datasets) {
        console.log('appModule: List of blacklisted dataSets: ' + Config.blackListDataSetsIds);
    } else {
        console.log('appModule: List of blacklisted dataSets has not been defined yet, go to the admin panel!');
        $scope.blacklist_datasets = [];
    }
	
	/* For IG blacklist */
    $scope.blacklist_indicatorgroups = Config.blackListIndicatorGroupIds;
    if($scope.blacklist_indicatorgroups) {
        console.log('appModule: List of blacklisted indicatorGroups: ' + $scope.blacklist_indicatorgroups);
    } else {
        console.log('appModule: List of blacklisted indicatorGroups has not been defined yet, go to the admin panel!');
        $scope.blacklist_indicatorgroups = [];
    }

	/* For admin tab */
	jQuery.ajax({
		url: dhisUrl + 'me?fields=userGroups[name]',
		contentType: 'json',
		method: 'GET',
		dataType: 'text',
		async: false
	}).success(function(me) {
		me = jQuery.parseJSON(me);
		var userGroups = me.userGroups.map(a=>a.name);
		me = (_.indexOf(userGroups,$scope.userAdminGroup) != -1 ) ? true : false;
		console.log('appModule: User authorised to administrate: ' + me);
		if(me) {
			$scope.show_admin = true;
		}
	}).fail(function() {
		console.log('appModule: Failed to check if user is authorised to administrate.');
	});

    /*
	 * 	@alias appModule.controller~ping
	 * 	@type {Function}
	 * 	@description Checks if session is not expired, if expired response is login-page(so then reload)
	 * 	@todo
	 */
	ping = function() {
		$.ajax({
			url: qryPing,
			dataType: "html",
			cache: false
		})
			.done(function(data) {
				if(data !== "pong") {
					document.location;
					document.location.reload(true);
				}
			});
	};

	csv_to_json = function(csv) {
		console.log(csv);
		var lines = csv.split("\n");
		var result = [];
		var headers = lines[0].split(",");

		for(var i = 1; i < lines.length; i++) {
			var obj = {};
			var currentline = lines[i].split(",");
			for(var j = 0; j < headers.length; j++) {
				obj[headers[j]] = currentline[j];
			}
			result.push(obj);
		}

		//return result; //JavaScript object
		return JSON.stringify(result); //JSON
	};

	/*
	 * 	@alias appModule.controller~tabSwitch
	 * 	@type {Function}
	 * 	@description Triggers ping and startLoadingState functions
	 * 	@todo
	 */
	tabSwitch = function() {
		ping();
		startLoadingState(true);
	};

	/*
	 * 	@alias appModule.controller~startLoadingState
	 * 	@type {Function}
	 * 	@description To make sure all emelemnts and indicators are loaded before printing
	 * 	@todo
	 */
	startLoadingState = function(onlyprint) {
		$(".printButton").prop("disabled", true);
		if(!onlyprint === true) {
			$(".loading").show();
		}
	};

	/*
	 * 	@alias appModule.controller~endLoadingState
	 * 	@type {Function}
	 * 	@description To make sure all emelemnts and indicators are loaded before printing
	 * 	@todo
	 */
	endLoadingState = function(disableprint) {
		if(disableprint === true) {
			setTimeout(function() {
				$(".printButton").prop("disabled", false)
			}, 1000);
		}
		$(".loading").hide();
	};
}]);
