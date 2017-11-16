/*------------------------------------------------------------------------------------
    List of contributors: https://github.com/MSFOCBA
    Please refer to the LICENSE.md and LICENSES-DEP.md for complete licenses.
------------------------------------------------------------------------------------*/

adminModule.controller('adminMainController', ['$scope', '$translate', 'adminOUGSFactory', 'adminUGFactory', 'adminAFactory', 'adminOUGFactory', 'adminDSFactory', 'adminIGFactory', 'adminDossierConfigCompleteFactory', function($scope, $translate, adminOUGSFactory, adminUGFactory, adminAFactory, adminOUGFactory, adminDSFactory, adminIGFactory, adminDossierConfigCompleteFactory) {
    $('#admin').tab('show');

    $scope.loaded = false;
    startLoadingState(false);

    $scope.dossierConfigComplete = {
      UG: false,
      OUGS: false,
      OUG: false,
      A: false
    };


    $scope.UGList = adminUGFactory.get_UG.query(function(response) {
        adminUGFactory.get_UG_set.query(function(response){
            if (response.value) {
                $scope.userAdminGroup = response.value;
                $scope.UGList.userGroups.forEach(function(ug) {
                    if (ug.id == response.object.id) {
                        $scope.selectedUG = ug;
                    }
                });
                $('#divUG').removeClass('alert-warning');
                $('#divUG').removeClass('alert-danger');
                $('#divUG').addClass('alert-success');

                $scope.dossierConfigComplete.UG = true;
            }
        }, function() {
            $('#divUG').removeClass('alert-warning');
            $('#divUG').removeClass('alert-success');
            $('#divUG').addClass('alert-danger');
        });
        endLoadingState();
    });

    $scope.OUGSList = adminOUGSFactory.get_OUGS.query(function(response) {
        adminOUGSFactory.get_OUGS_set.query(function(response){
            if (response.value) {
                $scope.serviceSetUID = response.value;
                $scope.OUGSList.organisationUnitGroupSets.forEach(function(ougs) {
                    if (ougs.id == response.object.id) {
                        $scope.selectedOUGS = ougs;
                    }
                });
                $('#divOUGS').removeClass('alert-warning');
                $('#divOUGS').removeClass('alert-danger');
                $('#divOUGS').addClass('alert-success');

                $scope.dossierConfigComplete.OUGS = true;

                adminOUGFactory.get({
                    ougsUID: $scope.serviceSetUID
                }, function(result) {
                    var test = true;
                    if(result.organisationUnitGroups.length > 0){
                        result.organisationUnitGroups.forEach(function(oug) {
                            if(!oug.code){
                                test = false;
                            }
                        });
                    }else{
                        test = false;
                    }
                    if (test) {
                        $('#divOUG').removeClass('alert-warning');
                        $('#divOUG').removeClass('alert-danger');
                        $('#divOUG').addClass('alert-success');

                        $scope.dossierConfigComplete.OUG = true;

                    }else{
                        $('#divOUG').removeClass('alert-success');
                        $('#divOUG').removeClass('alert-warning');
                        $('#divOUG').addClass('alert-danger');
                    }
                    endLoadingState(false);
                });
            }
        }, function() {
            $('#divOUGS').removeClass('alert-warning');
            $('#divOUGS').removeClass('alert-success');
            $('#divOUGS').addClass('alert-danger');

            $('#divOUG').removeClass('alert-warning');
            $('#divOUG').removeClass('alert-success');
            $('#divOUG').addClass('alert-danger');
        });
        endLoadingState();
    });



    $scope.$watch('selectedUG', function() {
        if (!($scope.selectedUG == undefined)) {
            $('#submitUG').removeClass('disabled');
        }
    });
    $scope.$watch('selectedOUGS', function() {
        if (!($scope.selectedOUGS == undefined)) {
            $('#submitOUGS').removeClass('disabled');
        }
    });

    $scope.submitUG = function() {
        var payload = '{"value":"' + $scope.selectedUG.name + '", "object":'+ JSON.stringify($scope.selectedUG) +'}';
        if ($scope.userAdminGroup) {
            adminUGFactory.upd_UG.query(payload,function(response){
                if (response) {
                    $scope.userAdminGroup = $scope.selectedUG.name;
                    $('#divUG').removeClass('alert-warning');
                    $('#divUG').removeClass('alert-danger');
                    $('#divUG').addClass('alert-success');
                }
            });
        }else{
            adminUGFactory.set_UG.query(payload,function(response){
                if (response) {
                    $scope.userAdminGroup = $scope.selectedUG.name;
                    $('#divUG').removeClass('alert-warning');
                    $('#divUG').removeClass('alert-danger');
                    $('#divUG').addClass('alert-success');
                }
            });
        }
        window.location.reload(true);
    };

    $scope.submitOUGS = function() {
        var payload = '{"value":"' + $scope.selectedOUGS.id + '", "object":'+ JSON.stringify($scope.selectedOUGS) +'}';
        if ($scope.serviceSetUID) {
            adminOUGSFactory.upd_OUGS.query(payload,function(response){
                if (response) {
                    $scope.serviceSetUID = $scope.selectedOUGS.id;
                    $('#divOUGS').removeClass('alert-warning');
                    $('#divOUGS').removeClass('alert-danger');
                    $('#divOUGS').addClass('alert-success');
                }
            });
        }else{
            adminOUGSFactory.set_OUGS.query(payload,function(response){
                if (response) {
                    $scope.serviceSetUID = $scope.selectedOUGS.id;
                    $('#divOUGS').removeClass('alert-warning');
                    $('#divOUGS').removeClass('alert-danger');
                    $('#divOUGS').addClass('alert-success');
                }
            });
        }
        window.location.reload(true);
    };

    adminAFactory.get(function(result) {
        var test = false;
        result.attributes.forEach(function(attr) {
            if (attr.name == "serviceCode" && attr.dataSetAttribute && attr.indicatorGroupAttribute) {
                test = true;
            }
        });
        if (test) {
            $('#divA').removeClass('alert-warning');
            $('#divA').removeClass('alert-danger');
            $('#divA').addClass('alert-success');

            $scope.dossierConfigComplete.A = true;
            setTimeout(function(){
              $scope.submitDossierConfigComplete();
            }, 2500);

        }else{
            $('#divA').removeClass('alert-warning');
            $('#divA').removeClass('alert-success');
            $('#divA').addClass('alert-danger');
        };
        endLoadingState(false);
    });

    if ($scope.blacklist_datasets) {
        $scope.selectedDS = JSON.stringify($scope.blacklist_datasets);
    }

    $scope.submitDS = function() {
        adminDSFactory.get_DS_set.query($scope.selectedDS).$promise.then(function(response1){
            return adminDSFactory.upd_DS.query($scope.selectedDS,function(response2){
                if (response2) {
                    $scope.blacklist_datasets = $scope.selectedDS;
                }
            });
        }, function() {
            return adminDSFactory.set_DS.query($scope.selectedDS,function(response2){
                if (response2) {
                    $scope.blacklist_datasets = $scope.selectedDS;
                }
            });
        }).then(function(){
            window.location.reload(true)
        });
    };

    if ($scope.blacklist_indicatorgroups) {
        $scope.selectedIG = JSON.stringify($scope.blacklist_indicatorgroups);
    }

    $scope.submitIG = function() {
        adminIGFactory.get_IG_set.query($scope.selectedIG).$promise.then(function(response1){
            return adminIGFactory.upd_IG.query($scope.selectedIG,function(response2){
                if (response2) {
                    $scope.blacklist_indicatorgroups = $scope.selectedIG;
                }
            });
        }, function() {
            return adminIGFactory.set_IG.query($scope.selectedIG,function(response){
                if (response) {
                    $scope.blacklist_indicatorgroups = $scope.selectedIG;
                }
            });
        }).then(function(){
            window.location.reload(true);
        });
    };

    $scope.submitDossierConfigComplete = function() {
        console.log("adminModule: $scope.dossierConfigComplete: ", $scope.dossierConfigComplete);
        var payload = $scope.dossierConfigComplete.UG && $scope.dossierConfigComplete.OUGS && $scope.dossierConfigComplete.OUG && $scope.dossierConfigComplete.A;
        payload = JSON.parse(JSON.stringify({ value: payload }));
        adminDossierConfigCompleteFactory.get_dossierConfigComplete_set.query().$promise.then(
          function(response1){
            response = JSON.parse(JSON.stringify(response1));
            console.log("adminModule: dossierConfigComplete: update, old - ", response.value, " / new - ", payload.value);
            if (response.value != payload.value) {
              return adminDossierConfigCompleteFactory.upd_dossierConfigComplete.query(payload,function(response2a){
                  window.location.reload(true);
              });
            }
          }, function() {
            return adminDossierConfigCompleteFactory.set_dossierConfigComplete.query(payload,function(response2b){
              console.log("adminModule: dossierConfigComplete: set");
              window.location.reload(true);
            });
          }
        );
    };

}]);
