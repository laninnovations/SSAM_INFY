import { WorkOrderEventLibrary as LibWoEvent } from '../../SAPAssetManager/Rules/WorkOrders/WorkOrderLibrary';
import { WorkOrderControlsLibrary as controls } from '../../SAPAssetManager/Rules/WorkOrders/WorkOrderLibrary';
import assignmentType from '../../SAPAssetManager/Rules/Common/Library/AssignmentType';

export default function WorkOrderCreateUpdateOnCommit(pageProxy) {
    return LibWoEvent.createUpdateValidationRule(pageProxy).then((result) => {
        if (result) {
            //validation pass
            assignmentType.setWorkOrderFieldDefault('PlanningPlant', controls.getPlanningPlant(pageProxy));
            assignmentType.setWorkOrderFieldDefault('WorkCenterPlant', controls.getWorkCenterPlant(pageProxy));
            assignmentType.setWorkOrderFieldDefault('MainWorkCenter', controls.getMainWorkCenter(pageProxy));
            // we   Start of the code changes done for CMW_Enhanc_01 - Current Location
            pageProxy.nativescript.appSettingsModule.setString("MobileStatus", pageProxy.binding.OrderMobileStatus_Nav.MobileStatus.toString());
            pageProxy.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/UpdateNewLocation.action');
            // End of the code changes done for CMW_Enhanc_01 - Current Location
            return LibWoEvent.CreateUpdateOnCommit(pageProxy);
        }
        return Promise.resolve(false);
         });
}
