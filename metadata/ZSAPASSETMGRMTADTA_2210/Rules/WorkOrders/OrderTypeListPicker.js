import libCom from '../../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function OrderTypeListPicker(context) {

    let contextBinding = libCom.setBindingObject(context);

    if(contextBinding.OrderType && contextBinding.OrderDescription){
        return context.read('/SAPAssetManager/Services/AssetManager.service', 'OrderTypes', [], '$orderby=OrderType').then(results => {
            if (results._array.length > 0) {
                let filterArr = results._array.filter((el, index) =>
                    index === results._array.findIndex(other => el.OrderTypeDesc === other.OrderTypeDesc)
                );
                let returnArr = filterArr.map(i => ({ 'ReturnValue': i.OrderType, 'DisplayValue': i.OrderType + " - " + i.OrderTypeDesc }));
                return returnArr;
            } return [];
        });
    } else {
        let returnArr = [
            {
                "DisplayValue": "PM01 - Corrective Maintenance",
                "ReturnValue": "PM01"
            },
            {
                "DisplayValue": "PM04 - Minor Maintenance",
                "ReturnValue": "PM04"
            },
            {
                "DisplayValue": "PM06 - General Maintenance",
                "ReturnValue": "PM06"
            }
    ];
        return returnArr;
    }

}
