/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
 
import getParentBinding from '../SignatureControlParentBinding';
export default function SignatureOnCreateOrderID(clientAPI) {
	let object = getParentBinding(clientAPI);
	let value =object['@odata.readLink'];
	if (object.OrderId.includes('LOCAL')){
		value += ':OrderId';
		return '<' + value + '>';
	}
	else{
		return object.OrderId;
	}
}
