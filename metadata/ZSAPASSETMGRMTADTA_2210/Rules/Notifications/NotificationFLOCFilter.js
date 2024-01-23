import libCom from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import { GlobalVar } from '../../../SAPAssetManager/Rules/Common/Library/GlobalCommon';

export default function NotificationFLOCFilter(context) {
    if (context.binding['@odata.type'] === '#sap_mobile.InspectionCharacteristic') {
        return `$filter=FuncLocIdIntern eq '${context.binding.EAMChecklist_Nav.FunctionalLocation}'&$orderby=FuncLocId`;
    }

    let notificationPlanningPlant;

    if (GlobalVar.getUserSystemInfo().get('USER_PARAM.IWK')) {
        notificationPlanningPlant = GlobalVar.getUserSystemInfo().get('USER_PARAM.IWK');
        notificationPlanningPlant = notificationPlanningPlant.split(',').map((plant) => `PlanningPlant eq '${plant}'`).join(' or ');
    } else {
        let defaultPlanningPlant = libCom.getAppParam(context, 'NOTIFICATION', 'PlanningPlant');
        notificationPlanningPlant = `PlanningPlant eq '${defaultPlanningPlant}'`;
    }
    
    if (notificationPlanningPlant) {
        return '$orderby=FuncLocId&$filter=true';
    } else {
        return '$orderby=FuncLocId&$filter=true';
    }
    
}
