import CurrentDateTime from '../../SAPAssetManager/Rules/DateTime/CurrentDateTime';

export default function GetLocalNotifNumber(context) {
    let timeStamp = CurrentDateTime(context);
	return ("Local_NO_" + timeStamp);
}