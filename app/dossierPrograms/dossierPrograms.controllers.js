/*------------------------------------------------------------------------------------
    List of contributors: https://github.com/MSFOCBA
    Please refer to the LICENSE.md and LICENSES-DEP.md for complete licenses.
------------------------------------------------------------------------------------*/

dossierProgramsModule.controller('dossierProgramsMainController', ['$scope', '$translate', '$anchorScroll', 'dossiersProgramsFactory', 'dossiersProgramStageSectionsFactory', 'dossiersProgramIndicatorsFactory', 'dossiersProgramExpressionFactory',
function($scope, $translate, $anchorScroll, dossiersProgramsFactory, dossiersProgramStageSectionsFactory, dossiersProgramIndicatorsFactory, dossiersProgramExpressionFactory) {
    $('#dossiersPrograms').tab('show');

    /*
     * 	@alias appModule.controller~addtoTOC
     * 	@type {Function}
     * 	@description Add an element (section or indicator group) to the Dossier Table Of Content (TOC)
     *	@todo Move to dossier controller
     */
    addtoTOC = function(toc, items, parent, type) {
        var index = toc.entries.push({
            'parent': parent,
            'children': items
        });
    };

    /*
     * 	@alias appModule.controller~scrollTo
     * 	@type {Function}
     * 	@description Scroll to an element when clicking on the Dossier Table Of Content (TOC)
     *	@todo Move to dossier controller
     *	@todo Take header into accounts
     */
    $scope.scrollTo = function(id) {
        $anchorScroll.yOffset = 66;
        $anchorScroll(id);
    };

    //service = program
    //indicatorGroups = indicators
    //Datasets = dataElements
    startLoadingState(false);
    $scope.programs = dossiersProgramsFactory.get(function() {
        endLoadingState(false);
    });

    //Clear the TOC
    $scope.$watch('selectedProgram', function() {
        ping();
        $scope.toc = {
            entries: []
        };
    });
}]);

dossierProgramsModule.controller('dossiersProgramSectionController', ['$scope', '$translate', 'dossiersProgramStageSectionsFactory', 'Ping', 
function($scope, $translate, dossiersProgramStageSectionsFactory, Ping) {

    $scope.stages4TOC = {
        displayName: "",
        id: "sectionContainer",
        index: '0'
    };

    $scope.$watch('selectedProgram', function() {
        ping();
        if ($scope.selectedProgram) {
            startLoadingState(false);
            //Query sections and data elements
            $scope.sections = dossiersProgramStageSectionsFactory.get({
                programStageId: $scope.selectedProgram.programStages[0].id
            }, function () {
                //if there are no sections rearrange/change TOC name
                if ($scope.sections.programStageSections.length == 0) $scope.showProgramWithoutSections();    
                else $scope.showProgramWithSections();            
            endLoadingState(true);
        });
        }
    });

   $scope.showProgramWithoutSections = function() {
        $scope.stages4TOC.displayName = "Data elements";
        //line needed to reuse code of the ng-repeat on the view
        $scope.sections.programStageSections =  [{displayName: "Data Elements", id:"DataElements", dataElements: $scope.sections.programStageDataElements}];

        for (i = 0; i < $scope.sections.programStageSections[0].dataElements.length; ++i) {
            $scope.sections.programStageSections[0].dataElements[i] = $scope.sections.programStageSections[0].dataElements[i].dataElement;
        }

        addtoTOC($scope.toc, null, $scope.stages4TOC, "programs");
    };

    $scope.showProgramWithSections = function() {
        $scope.stages4TOC.displayName = "Program Sections";
        addtoTOC($scope.toc, $scope.sections.programStageSections, $scope.stages4TOC, "programs");
    }


}]);




dossierProgramsModule.controller('dossiersProgramIndicatorController', ['$scope', 'dossiersProgramExpressionFactory', 'dossiersProgramFilterFactory', 'dossiersProgramIndicatorsFactory', function($scope, dossiersProgramExpressionFactory, dossiersProgramFilterFactory, dossiersProgramIndicatorsFactory) {

    $scope.indicators4TOC = {   
                displayName: "Program indicators",
                id: "IndicatorGroupsContainer",
                index: '1'
                };

    //gets the "readable" expressions for each indicator expression
    recursiveAssignExpression = function(i) {
        if (i >= $scope.indicators.programIndicators.length) return;
        dossiersProgramExpressionFactory.save({}, $scope.indicators.programIndicators[i].expression,
                         function (data) {
                            $scope.indicators.programIndicators[i].expression = data.description;
                            recursiveAssignExpression(i+1);
                        }); 

    }

    //gets the "readable" expressions for each indicator expression and filter
    recursiveAssignFilter = function(i) {
        if (i >= $scope.indicators.programIndicators.length) return;
        if (typeof($scope.indicators.programIndicators[i].filter) === 'undefined') {
            recursiveAssignFilter(i+1);
            return;
        }
        dossiersProgramFilterFactory.save({}, $scope.indicators.programIndicators[i].filter,
                         function (data) {
                            $scope.indicators.programIndicators[i].filter = data.description;
                            recursiveAssignFilter(i+1);
                        });

    }

    $scope.$watch('selectedProgram', function() {
        ping();
        if ($scope.selectedProgram) {
            startLoadingState(false);
            //get indicators, add to TOC
            $scope.indicators = dossiersProgramIndicatorsFactory.get({
                programId: $scope.selectedProgram.id
            }, function() {
                if ($scope.indicators.programIndicators.length > 0) {
                    addtoTOC($scope.toc,null,$scope.indicators4TOC,"Indicators");
                    recursiveAssignExpression(0);
                    recursiveAssignFilter(0);
                }
                endLoadingState(true);
            });
        }
    });

}]);


dossierProgramsModule.controller('dossierProgramGlobalIndicatorController', ['$scope', '$translate', 'programGlobalIndicators', 'programIndicatorExpression' , 'Ping', function($scope, $translate, programGlobalIndicators, programIndicatorExpression, Ping) {
    
    $scope.indicators4TOC = {
        displayName: "Indicators",
        id: "indicatorContainer",
        index: '2'
    };

    /*
     *  @name recursiveAssignNumerator
     *  @description Gets the "readable" expressions for each indicator numerator
     *  @scope dossierProgramGlobalIndicatorController
     */
    recursiveAssignNumerator = function(i) {
        if (i >= $scope.indicators.length) return;
        programIndicatorExpression.get({
                expression: $scope.indicators[i].numerator,
            }, function (data) {
                $scope.indicators[i].numerator = data.description;
                recursiveAssignNumerator(i+1);
            },true);

    }

    /*
     *  @name recursiveAssignNumerator
     *  @description Gets the "readable" expressions for each indicator denominator
     *  @scope dossierProgramGlobalIndicatorController
     */
    recursiveAssignDenominator = function(i) {
        if (i >= $scope.indicators.length) return;
        programIndicatorExpression.get({
                expression: $scope.indicators[i].denominator,
            }, function (data) {
                $scope.indicators[i].denominator = data.description;
                recursiveAssignDenominator(i+1);
            },true);
    }

    /*
     *  @name none
     *  @description Gets the indicator information, translates it and shows it
     *  @dependencies programGlobalIndicators, programIndicatorExpression
     *  @scope dossierProgramGlobalIndicatorController
     */
    $scope.$watch('selectedProgram', function() {
        ping();
        if ($scope.selectedProgram) {
            startLoadingState(false);
            $scope.indicators = [];
            //Query indicator information
            
            $scope.allIndicators = programGlobalIndicators.get(function () {   
                endLoadingState(true);
                $scope.allIndicators.indicators.forEach(function(indicator) {
                    const regex = /D{(\w+)\.?\w+?}/g;
                    const num = indicator.numerator;
                    const den = indicator.denominator;
                    let m;
                    console.log($scope.selectedProgram.id);
                    while ((m = regex.exec(num)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                        console.log(m[1]);
                        if (m[1] == $scope.selectedProgram.id) {
                            if ($scope.indicators.indexOf(indicator) == -1) $scope.indicators.push(indicator);
                            return;
                        }
                    }

                    while ((m = regex.exec(den)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                        if (m[1] == $scope.selectedProgram.id) {
                            if ($scope.indicators.indexOf(indicator) == -1) $scope.indicators.push(indicator);
                            return;
                        }
                    }
                }, this);
                if ($scope.indicators.length > 0) {
                    addtoTOC($scope.toc, null, $scope.indicators4TOC, "Indicators");
                    recursiveAssignNumerator(0);
                    recursiveAssignDenominator(0);
                }
            });
            
        }
    });
}]);