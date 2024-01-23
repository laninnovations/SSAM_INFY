import libCom from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import libVal from '../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';


export default function GetCostCenter(pageProxy) {

    let equipControl = pageProxy.evaluateTargetPath('#Page:WorkOrderCreateUpdatePage/#Control:EquipHierarchyExtensionControl');
    //let funcLocControl = pageProxy.evaluateTargetPath('#Page:WorkOrderCreateUpdatePage/#Control:FuncLocHierarchyExtensionControl');
    let equipment, costCenter = '';

        if (equipControl !== undefined && equipControl.getValue() !== undefined) {
            equipment =  equipControl.getValue();
            if (libCom.isCurrentReadLinkLocal(equipment)) {
                equipment = libCom.getEntityProperty(pageProxy, `MyEquipments(${equipment})`, 'EquipId').then(equipmentId => {
                    return equipmentId;
                });
            }
            costCenter = pageProxy.read('/SAPAssetManager/Services/AssetManager.service', `MyEquipments(EquipId='${equipment}')`, [], '&$select=CostCenter').then(function(data) {
                if (!libVal.evalIsEmpty(data.getItem(0).CostCenter)) {
                    costCenter = data.getItem(0).costCenter;
                } 
                return costCenter;
            });
        } 
        return costCenter;
}