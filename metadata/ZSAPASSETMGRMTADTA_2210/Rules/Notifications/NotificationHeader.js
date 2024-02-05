import libForm from '../../../SAPAssetManager/Rules/Common/Library/FormatLibrary';
import CommonLibrary from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function NotificationHeader(context) {
    let binding = context.binding;
    // let mainWorkcenter = CommonLibrary.getUserDefaultWorkCenter();
    // return `${libForm.formatDetailHeaderDisplayValue(context, binding.NotificationNumber, 
    //     context.localizeText('notification'))} + ${mainWorkcenter}`;
    return `${libForm.formatDetailHeaderDisplayValue(context, binding.NotificationNumber, 
          context.localizeText('notification'))}`;
}
