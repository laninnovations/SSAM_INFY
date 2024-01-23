import libCom from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import libVal from '../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';


export default function GetPlannerGroup(pageProxy) {

    let equipControl = pageProxy.evaluateTargetPath('#Page:WorkOrderCreateUpdatePage/#Control:EquipHierarchyExtensionControl');
    //let funcLocControl = pageProxy.evaluateTargetPath('#Page:WorkOrderCreateUpdatePage/#Control:FuncLocHierarchyExtensionControl');
    let equipment, floc, plannerGroup = '';

        if (equipControl !== undefined && equipControl.getValue() !== undefined) {
            equipment =  equipControl.getValue();
            if (libCom.isCurrentReadLinkLocal(equipment)) {
                equipment = libCom.getEntityProperty(pageProxy, `MyEquipments(${equipment})`, 'EquipId').then(equipmentId => {
                    return equipmentId;
                });
            }
            plannerGroup = pageProxy.read('/SAPAssetManager/Services/AssetManager.service', `MyEquipments(EquipId='${equipment}')`, [], '&$select=PlannerGroup').then(function(data) {
                if (!libVal.evalIsEmpty(data.getItem(0).PlannerGroup)) {
                    plannerGroup = data.getItem(0).plannerGroup;
                } 
                return plannerGroup;
            });
        } 
        return plannerGroup;
}