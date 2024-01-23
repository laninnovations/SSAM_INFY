import libVal from '../../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';

export default function ErrorArchiveDetailsMessage(context) {
    let errorObject = context.getPageProxy().binding.ErrorObject;

    if (errorObject) {
        try {
            let message = JSON.parse(errorObject.Message);
            let m;
            var regex = /Message =\s*(.*?)\s*Type =/g;
            var lasterrorMessage = message.error.message.value.match(/^.*Message =(.*$)/)[1];
            
            var matches = [];
            while (m = regex.exec(message.error.message.value)) {
                    matches.push(m[1]);
                }
            matches.push(lasterrorMessage);
            let errorMessage = [...new Set(matches)];

            return errorMessage;
        } catch (e) {
            if (!libVal.evalIsEmpty(errorObject.Message)) {
                return errorObject.Message;
            } else {
                return '-';
            }
        }
    } 

    return '-';
}