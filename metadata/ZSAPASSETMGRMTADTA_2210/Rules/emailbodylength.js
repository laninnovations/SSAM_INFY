/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
import libCom from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';
export default function emailbodylength(clientAPI) {
    const noteValue = context.getValue();
    let charLimit = libCom.getAppParam(context, 'ZBody', 'DescriptionLength');
    let charLimitInt = parseInt(charLimit);

    if (noteValue && noteValue.length > charLimitInt) {
        libCom.executeInlineControlError(context, context, context.localizeText('validation_maximum_field_length', [charLimit]));
    } else {
        context.clearValidationOnValueChange();
    }
}