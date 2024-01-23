import libCom from '../../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
import libVal from '../../../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';
import OnOperationChangeListPickerUpdate, {redrawListControl} from '../../../../SAPAssetManager/Rules/Confirmations/CreateUpdate/OnOperationChangeListPickerUpdate';

export default function OnOperationChanged(context) {
    let selection = context.getValue()[0] ? context.getValue()[0].ReturnValue : '';
    let pageProxy = context.getPageProxy();
    let opControl = libCom.getControlProxy(pageProxy, 'OperationPkr');

    /* Clear the validation if the field is not empty */
    if (!libVal.evalIsEmpty(opControl.getValue())) {
        opControl.clearValidationOnValueChange();
    }
    
    if (selection.length === 0) {
        return redrawListControl(pageProxy, 'SubOperationPkr', '', false, true).then(() => {
            return redrawListControl(pageProxy, 'ActivityTypePkr', '', false, true).then(() => {
                return redrawListControl(pageProxy, 'VarianceReasonPkr', '', false, true).then(() => {
                    return redrawListControl(pageProxy, 'TechnicianNamePkr', '', false, true).then(() => {
                        pageProxy.getControl('FormCellContainer').redraw();
                        return true;
                    });
                });
            });
        });
    } else {
        return OnOperationChangeListPickerUpdate(pageProxy);
    }
}
