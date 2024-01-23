/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ZIJC_LOCATIONS_ReadLink(clientAPI) {
	// let uri = `ZIJC_LOCATIONS(ZObjectType='${clientAPI.binding.ObjectType}',ZObjectkey='${clientAPI.binding.ObjectKey}',ZTransactionMode='CH',ZUserName='MOHASA1J',ZCreatedOn=datetime'9999-12-31T14:49:52',ZTime=time'PT18H31M41S')`
	let uri = `ZIJC_LOCATIONS(ZObjectType='NT',ZObjectkey='11307312',ZTransactionMode='CH',ZUserName='MOHASX1J',ZCreatedOn=datetime'2019-01-08T14:50:55',ZTime=time'PT14H50M55S')`
	// var dlg = clientAPI.nativescript.uiDialogsModule;
	// dlg.alert("Calling ZIJC_Locations_ReadLink");
	return uri;
}