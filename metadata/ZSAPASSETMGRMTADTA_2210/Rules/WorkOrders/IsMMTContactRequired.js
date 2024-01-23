import libCommon from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
/**
 * Checks to see if object in context.binding is a service order or not.
 * Used to show\hide ServiceOrderLocationSection is WorkOrderDetails.page.
 * 
 * @param {*} context
 * @returns true if it's a order.
 */
export default function IsMMTContactRequired(context) {
    //WorkOrderType
    let type = libCommon.getTargetPathValue(context, '#Page:WorkOrderCreateUpdatePage/#Control:TypeLstPkr/#SelectedValue');

    if(type === 'PM04'){
        return true
    } else {
        return false
    }
}
