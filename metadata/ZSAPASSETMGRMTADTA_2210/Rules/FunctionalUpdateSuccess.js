/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function FunctionalUpdateSuccess(clientAPI) {
	var dlg = clientAPI.nativescript.uiDialogsModule;
	clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/Closefunctinallocatiuoncreatepage.action');
	dlg.alert("Functional Location Update Successfully!");
}
