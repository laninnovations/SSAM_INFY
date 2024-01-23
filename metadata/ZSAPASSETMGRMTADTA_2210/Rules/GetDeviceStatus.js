/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
// import NativeScriptObject from './Library/NativeScriptObject';

export default function GetDeviceStatus(clientAPI) {
	// Obtain a reference to the NativeScript Module for checking
	// const connectivityModule = NativeScriptObject.getNativeScriptObject(clientAPI).connectivityModule;
	// const connectionType = connectivityModule.getConnectionType();
	// return (connectionType === connectivityModule.connectionType.none) ? false : true;

	// Obtain a reference to the NativeScript connectivity Module
	const connectivityModule = clientAPI.nativescript.connectivityModule;
	
	if (connectivityModule.getConnectionType() === 1 || connectivityModule.getConnectionType() === 2 || connectivityModule.getConnectionType() === 5) {
		console.log("Device is online");
		// var dlg = clientAPI.nativescript.uiDialogsModule;
		// dlg.alert("Device is online");
		clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/NavigateToEmailPage.action');
	} else {
		console.log("Device is offline");
		// var dlg = clientAPI.nativescript.uiDialogsModule;
		// dlg.alert("Device is offline");
		clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/showUserIsOffline.action');
	}

	// var dlg = clientAPI.nativescript.uiDialogsModule;
	// dlg.alert("Calling Before Update");
	// clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/MDGFunctionalcreate.action');

}