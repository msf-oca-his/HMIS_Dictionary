appModule.factory('Config', [function() {
		return {
			userGroupId: 'z9jKg7FEuaT',
			organisationGroupSetId:'QSiGnQwGi92',
			blackListDataSetsIds:['YoJjavJ432r','wcCbcAKbP'],
			blackListIndicatorGroupIds:[],
			showUserRelatedFormsOnly:true,
            showIndicatorFormulaNonAdminUser: false,
            showIndicatorFormulaAdminUser: true,
			defaultValueForShowIndicatorFormula: true,
			// Available: Name, Form Name, Short Name, Code, Description, DataType Element,	Aggregation Type,
			// 	Options, Category combination
			dataset: {
                show: ['Name', 'Short Name', 'Description', 'DataType Element', 'Aggregation Type', 'Options', 'Category combination']
            },
            // Available: Name, Form Name, Short Name, Code, Description, DataType Element, Options
            program: {
                show: ['Name', 'Short Name', 'Description', 'DataType Element', 'Aggregation Type', 'Options']
            }
		}
	}
]);
