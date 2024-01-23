import libVal from '../../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';
import EquipmentCount from '../../../SAPAssetManager/Rules/Equipment/EquipmentCount';
import EquipEntity from '../../../SAPAssetManager/Rules/Equipment/EquipmentEntitySet';
import EquipQuery from '../../../SAPAssetManager/Rules/Equipment/EquipmentQueryOptions';


export default function OnEquipmentFilterSuccess(context) {
    let queryOption = libVal.evalIsEmpty(context.actionResults.filterResult) ? '' : context.actionResults.filterResult.data.filter;
    let entitySet = EquipEntity(context);
    if (!libVal.evalIsEmpty(EquipQuery(context))) {
        if (EquipQuery(context).includes('$filter=')) {
            if (queryOption.includes('$filter=') && !libVal.evalIsEmpty(queryOption.replace('$filter=',''))) {
                queryOption = queryOption + ' and ' + '('+ EquipQuery(context).replace('$filter=','')+')' ;
            } else {
                queryOption = EquipQuery(context) + '&'+ queryOption;
            }
        } else {
            queryOption = EquipQuery(context) + '&'+ queryOption;
        }
    }

    return setEquipmentCaptionWithCount(context, entitySet, queryOption);
}

function setEquipmentCaptionWithCount(context, entitySet, queryOption) {
    var params = [];
    let totalCountPromise = EquipmentCount(context);
    let countPromise = context.count('/SAPAssetManager/Services/AssetManager.service',entitySet, queryOption);

    return Promise.all([totalCountPromise, countPromise ]).then(function setCountCaption(countsArray) {
        let totalCount = countsArray[0];
        let count = countsArray[1];

        params.push(count);
        params.push(totalCount);
        if (count === totalCount) {
            return context.setCaption(context.localizeText('equipment_x', [totalCount]));
        }
        return context.setCaption(context.localizeText('equipment_x', [totalCount]));
    });
}
