import libCom from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import QueryBuilder from '../../SAPAssetManager/Rules/Common/Query/QueryBuilder';
import libVal from '../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';


export default function TechnicianNameQueryOption(context) {
	// return `$filter=ZPlant eq 'Z002' and ZWorkCenter eq 'NRL_PT'`;
	// return `$filter=ZPlant eq '{PlanningPlant}' and ZWorkCenter eq '{WorkCenterInternalId}'`
	let workOrder = libCom.getListPickerValue(libCom.getTargetPathValue(context, '#Control:WorkOrderLstPkr/#Value'));
    let operation = libCom.getListPickerValue(libCom.getTargetPathValue(context, '#Control:OperationPkr/#Value'));
    let plant, workCenter = '';
    if ((libVal.evalIsEmpty(workOrder)) && (libVal.evalIsEmpty(operation))) {
        workOrder = context.binding.OrderID;
        operation = context.binding.Operation;
    }
    if (!libVal.evalIsEmpty(context.binding.Plant)) {
        plant = context.binding.Plant;
    }
	let queryBuilder = new QueryBuilder();
    if ((!libVal.evalIsEmpty(workOrder)) && (!libVal.evalIsEmpty(operation))) {
        return context.read('/SAPAssetManager/Services/AssetManager.service', `MyWorkOrderOperations(OrderId='${workOrder}',OperationNo='${operation}')`, [], '$expand=WOHeader&$select=MainWorkCenter,MainWorkCenterPlant,MaintenancePlant,WOHeader/MainWorkCenterPlant,WOHeader/MaintenancePlant,WOHeader/PlanningPlant').then(function(data) {
            if (!libVal.evalIsEmpty(data.getItem(0).MainWorkCenterPlant)) {
                plant = data.getItem(0).MainWorkCenterPlant;
            } else if (!libVal.evalIsEmpty(data.getItem(0).MaintenancePlant)) {
                plant = data.getItem(0).MaintenancePlant;
            } else if (!libVal.evalIsEmpty(data.getItem(0).WOHeader.MainWorkCenterPlant)) {
                plant = data.getItem(0).WOHeader.MainWorkCenterPlant;
            } else if (!libVal.evalIsEmpty(data.getItem(0).WOHeader.MaintenancePlant)) {
                plant = data.getItem(0).WOHeader.MaintenancePlant;
            } else if (!libVal.evalIsEmpty(data.getItem(0).WOHeader.PlanningPlant)) {
                plant = data.getItem(0).WOHeader.PlanningPlant;
            }
			workCenter = data.getItem(0).MainWorkCenter;
            if (!libVal.evalIsEmpty(plant)) {
                queryBuilder.addFilter(`ZPlant eq '${plant}' and ZWorkCenter eq '${workCenter}'`);	
            }    
            return queryBuilder.build();
        });
    } else {
		return `$filter=ZPlant eq ${plant} and ZWorkCenter eq ${workCenter}`
	} 
}