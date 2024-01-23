import libCom from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function NotifTypeListPicker(context) {

    let contextBinding = libCom.setBindingObject(context);

    if(contextBinding.NotificationType && contextBinding.NotificationDescription){
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'NotificationTypes', [], '$orderby=NotifType').then(results => {
            if (results._array.length > 0) {
                let filterArr = results._array.filter((el, index) =>
                    index === results._array.findIndex(other => el.Description === other.Description)
                );
                let returnArr = filterArr.map(i => ({ 'ReturnValue': i.NotifType, 'DisplayValue': i.NotifType + " - " + i.Description }));
                return returnArr;
            } return [];
        });
    } else {
        let returnArr = [
            {
                "DisplayValue": "M1 - General Maint Req",
                "ReturnValue": "M1"
            },
            /**{
                "DisplayValue": "M2 - Corrective Manit Req",
                "ReturnValue": "M2"
            },**/
            {
                "DisplayValue": "M3 - Activity Report",
                "ReturnValue": "M3"
            }
    ];
        return returnArr;
    }

}
