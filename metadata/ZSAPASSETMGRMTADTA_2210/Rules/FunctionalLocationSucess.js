/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function Test(clientAPI) {
	var dlg = clientAPI.nativescript.uiDialogsModule;
    clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/Closefunctinallocatiuoncreatepage.action');
	dlg.alert("Functional Location Created Successfully!");
	// clientAPI.executeAction("/ZSAPASSETMGRMTADTA_2210/Actions/UpdateNewLocation.action"
}