import libForm from '../Common/Library/FormatLibrary';
import CommonLibrary from '../Common/Library/CommonLibrary';

export default function NotificationHeader(context) {
    let binding = context.binding;
    let mainWorkcenter = CommonLibrary.getUserDefaultWorkCenter();
    return `${libForm.formatDetailHeaderDisplayValue(context, binding.NotificationNumber, 
        context.localizeText('notification'))} + ${mainWorkcenter}`;
}
