import libCom from '../../SAPAssetManager/Rules/Common/Library/CommonLibrary';

export default function GetDuration(context) {

    let durationControlValue = libCom.getControlProxy(context,'DurationPkr').getValue();
    // Start of code changes for Duration issue - 798395/2023
    durationControlValue = durationControlValue/60;
    // End of code changes for Duration issue - 798395/2023
    return durationControlValue.toString();
}
