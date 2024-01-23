/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetCurrentLoggedInUser(clientAPI) {
	return clientAPI.evaluateTargetPath('#Application/#ClientData/UserId');
}
