import appSettings from '../../SAPAssetManager/Rules/Common/Library/ApplicationSettings';
import libVal from '../../SAPAssetManager/Rules/Common/Library/ValidationLibrary';

export default function AllSyncronizationGroups(context) {

	let count = appSettings.getNumber(context, 'SyncGroupCount');
	let definingRequests = [];

	if (libVal.evalIsNumeric(count)) {
		for (let index = 0; index < count; index++) {
			let entitysetName = appSettings.getString(context, 'SyncGroup-' + index);
			definingRequests.push({
				'Name': entitysetName,
				'Query': entitysetName,
			});
		}
	}

	// Start of code changes done for Custom Fields in Offline service
	let zEntities = [{
			'Name': "ZIJC_LOCATIONS",
			'Query': "ZIJC_LOCATIONS",
		}, {
			'Name': "ZUserLists",
			'Query': "ZUserLists",
		},
		// , {
		// 	'Name': "ZEmailAttachmentSet",
		// 	'Query': "ZEmailAttachmentSet",
		// },
		{
			'Name': "ZEquipmentMDGSet",
			'Query': "ZEquipmentMDGSet",
		}, 
		{
			'Name': "ZFuncLocationMDGSet",
			'Query': "ZFuncLocationMDGSet",
		}

	];

	return Array.prototype.concat.apply([], [definingRequests, zEntities])

	// End of code changes done for Custom Fields in Offline service

	// return definingRequests;
}