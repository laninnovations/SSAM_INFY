/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function SetStagingForEmailUpdate(clientAPI) {
	//Check if attachments are present
	const pageProxy = clientAPI.getPageProxy();
	let containerProxy = pageProxy.getControl('FormCellContainer0');
	let selection = containerProxy.getControl('FormCellAttachmentEmail').getValue()[0];
	let aUploadAttachmentsPromise = [];
	var attachments = clientAPI.evaluateTargetPath("#Control:FormCellAttachmentEmail/#Value");
		// var mailBody = clientAPI.evaluateTargetPath("#Page:EmailClient/#Control:FormCellNote0/#Value")
	clientAPI.showActivityIndicator();
	if (attachments.length !== 0) {
		clientAPI.executeAction('/SAPAssetManager/Actions/OData/OpenOnlineService.action').then(function () {
			for (let i = 0; i < attachments.length; i++) {
				let sMediaPath = `#Control:FormCellAttachmentEmail/#Value/#Index:${i}`;
				let fileNameArray = attachments[i].urlString.split('/');
				let fileNameArrayLength = fileNameArray.length;
				let attachmentName = fileNameArray[fileNameArrayLength - 1];
				aUploadAttachmentsPromise.push(clientAPI.executeAction({
						"Name": "/ZSAPASSETMGRMTADTA_2210/Actions/GenerateEmail.action",
						"Properties": {
							"Properties": {
								"ZUserName": clientAPI.evaluateTargetPath("#Application/#ClientData/UserId")
							},
							"Headers": {
								"SLUG": attachmentName
							},
							"Media": sMediaPath,
							"Target": {
								"Service": "/ZSAPASSETMGRMTADTA_2210/Services/OnlineAssetManager.service",
								"EntitySet": "Zattachmentses"
							}
						}
					}).catch(() => {
						Logger.error('GenerateEmail', 'Email Generation from online service failed');
					})
				)
			}
			return Promise.all(aUploadAttachmentsPromise).then(function() {
				let ZBody = "Please create a ticket and assign it to 'CMS_SAP PM CMS'. " + clientAPI.evaluateTargetPath("#Control:FormCellNote0/#Value");
				let ZRecipient = clientAPI.evaluateTargetPath("#Control:FormCellSimpleProperty1/#Value");
				let ZSubject = clientAPI.evaluateTargetPath("#Control:FormCellSimpleProperty2/#Value");
				return clientAPI.executeAction({
					"Name": "/ZSAPASSETMGRMTADTA_2210/Actions/SendEmailWithAttachments.action",
						"Properties": {
							"Properties": {
								"ZBody": ZBody,
								"ZRecipient": ZRecipient,
								"ZSubject": ZSubject,
								"Zhas_attachment": "X",
								"ZUserName": clientAPI.evaluateTargetPath("#Application/#ClientData/UserId")
							}
						}
				}).catch(() => {
					Logger.error('GenerateEmail', 'Email Generation from online service failed');
					}).then(function () {
						clientAPI.dismissActivityIndicator();
					}).catch(() => {
					clientAPI.dismissActivityIndicator();
					Logger.error('GenerateEmail', 'Email Generation from online service failed');
				});
			})
		}).catch(() => {
			clientAPI.dismissActivityIndicator();
			Logger.error('GenerateEmail', 'Connecting to online service failed');
		});
	} else {
		return clientAPI.executeAction('/SAPAssetManager/Actions/OData/OpenOnlineService.action').then(function () {
			let ZBody = "Please create a ticket and assign it to 'CMS_SAP PM CMS'. " + clientAPI.evaluateTargetPath("#Control:FormCellNote0/#Value");
			let ZRecipient = clientAPI.evaluateTargetPath("#Control:FormCellSimpleProperty1/#Value");
			let ZSubject = clientAPI.evaluateTargetPath("#Control:FormCellSimpleProperty2/#Value");
			return clientAPI.executeAction({
				"Name": "/ZSAPASSETMGRMTADTA_2210/Actions/SendEmailWithOutAttachments.action",
				"Properties": {
					"Properties": {
						"ZBody": ZBody,
						"ZRecipient": ZRecipient,
						"ZSubject": ZSubject,
						"Zhas_attachment": "",
						"ZUserName": clientAPI.evaluateTargetPath("#Application/#ClientData/UserId")
					}
				}
			}).then(function () {
				clientAPI.dismissActivityIndicator();
			}).catch(() => {
				clientAPI.dismissActivityIndicator();
				Logger.error('UserFeatures', 'Reading UserFeatures from online service failed');
			});
		}).catch(() => {
			Logger.error('UserFeatures', 'Connecting to online service failed');
		});
// clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/SendEmailWithOutAttachments.action');
	}
}