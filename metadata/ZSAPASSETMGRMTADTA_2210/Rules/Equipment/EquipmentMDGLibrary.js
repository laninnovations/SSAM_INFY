
export class EquipmentMDGLibrary {
        /**
     * This will returns the correct PickerItems for the Picker Controls
     * @param {IControlProxy} controlProxy
     */
        static createUpdateControlsPickerItems(controlProxy) {
            let controlName = controlProxy.getName();
    
            //Determine if we are on create
            //let onCreate = libCommon.IsOnCreate(controlProxy.getPageProxy());
    
            // Based on the control we are on, return the right list items accordingly
            if (controlName === 'MaintenacePlantLstPkr') {
                return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], '$orderby=PlanningPlant').then(obArray => {
                    var jsonResult = [];
                    obArray.forEach(function(element) {
                        jsonResult.push(
                            {
                                'DisplayValue': `${element.PlanningPlant} - ${element.PlantDescription}`,
                                'ReturnValue': element.PlanningPlant,
                            });
                    });
                    const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                    let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                    return finalResult;
                });
            } else if (controlName === 'PlanningPlant') {
                return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], '$orderby=PlanningPlant').then(obArray => {
                    var jsonResult = [];
                    obArray.forEach(function(element) {
                        jsonResult.push(
                            {
                                'DisplayValue': `${element.PlanningPlant} - ${element.PlantDescription}`,
                                'ReturnValue': element.PlanningPlant,
                            });
                    });
                    const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                    let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                    return finalResult;
                });
            } else if (controlName === 'CatalogProfile') {
                //TODO - AssignmentType case scenario will be needed here after more AssignmentType are introduced
                //let planningPlant = onCreate ? appParams.get('PlanningPlant') : libCommon.getTargetPathValue(controlProxy, '#Property:PlanningPlant');
                //let mainWorkCenter = userInfo.get('USER_PARAM.AGR');
                //let queryOption = `$filter=PlantId eq '${planningPlant}' and ExternalWorkCenterId eq '${mainWorkCenter}'`;
    
                return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'PMCatalogProfiles', [], '').then(function(obArray) {
                    var jsonResult = [];
                    obArray.forEach(function(element) {
                        jsonResult.push(
                            {
                                'DisplayValue': `${element.CatalogProfile} - ${element.CatalogProfileDesc}`,
                                'ReturnValue': element.CatalogProfile,
                            });
                    });
                    const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                    let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                    return finalResult;
                });
            } else if (controlName === 'CostCenter') {
                //TODO - AssignmentType case scenario will be needed here after more AssignmentType are introduced
                //let planningPlant = onCreate ? appParams.get('PlanningPlant') : libCommon.getTargetPathValue(controlProxy, '#Property:PlanningPlant');
                //let mainWorkCenter = userInfo.get('USER_PARAM.AGR');
                //let queryOption = `$filter=PlantId eq '${planningPlant}' and ExternalWorkCenterId eq '${mainWorkCenter}'`;
    
                return controlProxy.read('/SAPAssetManager/Services/AssetManager.service', 'COActivityTypes', [], '').then(function(obArray) {
                    var jsonResult = [];
                    obArray.forEach(function(element) {
                        jsonResult.push(
                            {
                                'DisplayValue': `${element.CostCenter} - ${element.CostCenterDescription}`,
                                'ReturnValue': element.CostCenter,
                            });
                    });
                    const uniqueSet = new Set(jsonResult.map(item => JSON.stringify(item)));
                    let finalResult = [...uniqueSet].map(item => JSON.parse(item));
                    return finalResult;
                });
            } else {
                return Promise.resolve([]);
            }
        }
}

