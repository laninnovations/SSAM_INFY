import CurrentDateTime from '../../SAPAssetManager/Rules/DateTime/CurrentDateTime';

export default function GetLocalOrderNumber(context) {
    let timeStamp = CurrentDateTime(context);
	return ("Local_WO_" + timeStamp);
}