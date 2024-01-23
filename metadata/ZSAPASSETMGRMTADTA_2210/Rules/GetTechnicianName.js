/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetTechnicianName(clientAPI) {
	return context.evaluateTargetPath('#Control:TechnicianNamePkr/#SelectedValue');
}