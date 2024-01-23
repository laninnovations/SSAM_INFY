/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function ShowFailureToastAndClose(clientAPI) {
	var dlg = clientAPI.nativescript.uiDialogsModule;
	clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/ClosePage.action');
	dlg.alert("Email was not sent due to Server error, please try after sometime!");
}
