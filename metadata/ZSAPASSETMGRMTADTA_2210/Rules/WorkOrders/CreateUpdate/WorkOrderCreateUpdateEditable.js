import libCommon from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import assnType from '../../../../SAPAssetManager/Rules/Common/Library/AssignmentType';

// Define these as shared vars
let isLocal, onCreate;

function isEditable(controlName) {
    let controlDefs = assnType.getWorkOrderAssignmentDefaults();

    if (!onCreate && !isLocal && !controlDefs[controlName].enabled) {
        return false;
    }
    return controlDefs.type === 'WorkOrderHeader' ? controlDefs[controlName].enabled : true;
}

export default function WorkOrderCreateUpdateEditable(control) {
    let controlName = control.getName();
    let currentReadLink = libCommon.getTargetPathValue(control.getPageProxy(), '#Property:@odata.readLink');

    isLocal = libCommon.isCurrentReadLinkLocal(currentReadLink);
    onCreate = libCommon.IsOnCreate(control.getPageProxy());

    switch (controlName) {
        case 'TypeLstPkr':    
                return onCreate; //Order type not editable on fetched orders and when editing local work orders
        case 'MainWorkCenterLstPkr':
            return isEditable('MainWorkCenter');
        case 'WorkCenterPlantLstPkr':
            return isEditable('WorkCenterPlant');
        case 'PMActivityTypeLstPkr':    
            return onCreate; 
        case 'PlanningPlantLstPkr':
            if (isEditable('PlanningPlant')) {
                return onCreate || isLocal; //Planning plant not editable on fetched work orders
            }
            return false;
        default:
            return true;
    }
}
