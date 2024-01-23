/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function CreateFunctionalLocation(clientAPI) {
 //  var dlg = clientAPI.nativescript.uiDialogsModule;
	clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/MDGFunctionalupdate.action');
}
