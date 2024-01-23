/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function Test1(clientAPI) {
	var dlg = clientAPI.nativescript.uiDialogsModule;
	clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/Closefunctinallocatiuoncreatepage.action');
	dlg.alert("Calling Equipment Createsuccessfully!");
}