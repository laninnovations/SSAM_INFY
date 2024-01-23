import appSettings from '../../SAPAssetManager/Rules/Common/Library/ApplicationSettings';
/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetLatitude(clientAPI) {
	return clientAPI.nativescript.appSettingsModule.getString("Lattitude");
}