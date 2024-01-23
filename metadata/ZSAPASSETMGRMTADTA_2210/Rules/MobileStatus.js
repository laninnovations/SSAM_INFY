/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function MobileStatus(clientAPI) {
	// return clientAPI.nativescript.appSettingsModule.getString("MobileStatus");
	//test comment fenil for Git
	return clientAPI.binding.OrderMobileStatus_Nav.MobileStatus;
}
