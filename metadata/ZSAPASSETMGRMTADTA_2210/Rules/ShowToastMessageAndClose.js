/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ShowToastMessageAndClose(clientAPI) {
	var dlg = clientAPI.nativescript.uiDialogsModule;
	clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/ClosePage.action');
	dlg.alert("Email Sent Successfully!");
}
