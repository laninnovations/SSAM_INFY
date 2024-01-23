
import libCommon from '../Common/Library/CommonLibrary';
import libVal from '../Common/Library/ValidationLibrary';
import { SplitReadLink } from '../Common/Library/ReadLinkUtils';

export default function GetWorkOrderHeaderAndOperation(context) {
    if (context.binding.hasOwnProperty('OperationNo') && context.binding.hasOwnProperty('OrderId')) {
        return context.binding.OrderId + context.binding.OperationNo;
    } else if (context.binding.hasOwnProperty('Operation') && context.binding.hasOwnProperty('RecOrder')) {
        return context.binding.RecOrder + context.binding.Operation;
    } else if (context.binding.hasOwnProperty('OrderId')) {
        return context.binding.OrderId;
    } else if (context.binding.hasOwnProperty('RecOrder')) {
        return context.binding.RecOrder;
    } else if (context.binding.hasOwnProperty('OrderID') && context.binding.hasOwnProperty('Operation')) {
        return context.binding.OrderID + context.binding.Operation;
    } else if (context.binding['@odata.type'] === '#sap_mobile.CatsTimesheetOverviewRow') {
        let formCellContainer = context.getControl('FormCellContainer');
        let operationListPicker = formCellContainer.getControl('OperationLstPkr');
        let selectedOperation = libCommon.getListPickerValue(operationListPicker.getValue());
        let currObject = SplitReadLink(selectedOperation);

        return (!libVal.evalIsEmpty(currObject.OrderId) && !libVal.evalIsEmpty(currObject.OperationNo)) ? currObject.OrderId + currObject.OperationNo : '';
    }
    return '';
}
