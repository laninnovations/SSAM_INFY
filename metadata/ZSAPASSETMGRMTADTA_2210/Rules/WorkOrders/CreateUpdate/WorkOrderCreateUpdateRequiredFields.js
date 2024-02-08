import { WorkOrderLibrary as libWo } from '../WorkOrderLibrary';
import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function WorkOrderCreateUpdateRequiredFields(context) {
    let requiredFields = [
        'DescriptionNote',
        'PlanningPlantLstPkr',
        'TypeLstPkr',
        'PrioritySeg',
        'MainWorkCenterLstPkr',
        'PMActivityTypeLstPkr'
    ];

    return libWo.isSoldPartyRequired(context).then((required) => {
        if (required) {
            requiredFields.push('SoldToPartyLstPkr');
        }
        const orderType = libCommon.getTargetPathValue(context, '#Page:WorkOrderCreateUpdatePage/#Control:TypeLstPkr/#SelectedValue');
        let equipControl = context.evaluateTargetPathForAPI('#Page:WorkOrderCreateUpdatePage/#Control:EquipHierarchyExtensionControl');
        let funcLocControl = context.evaluateTargetPathForAPI('#Page:WorkOrderCreateUpdatePage/#Control:FuncLocHierarchyExtensionControl');
        if (orderType === 'PM04'){
            requiredFields.push('MMTContact');
        }
        if (!funcLocControl.getValue()){
            if (!equipControl.getValue()){
                requiredFields.push('FuncLocHierarchyExtensionControl');
                requiredFields.push('EquipHierarchyExtensionControl');
            }
        }
        return requiredFields;
    });
}
