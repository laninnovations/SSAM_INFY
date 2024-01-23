import Logger from '../../../SAPAssetManager/Rules/Log/Logger';
import lamFilter from '../../../SAPAssetManager/Rules/LAM/LAMFilter';

export default function LAMNav(context) {
	let pageProxy = context.getPageProxy();
	let actionContext = pageProxy.getActionBinding();
	let filter = lamFilter(context),
		gLAM;

	//Rebind the LAM data
	return context.read('/SAPAssetManager/Services/AssetManager.service', actionContext['@odata.readLink'] + '/LAMObjectDatum_Nav', [], filter)
		.then(LAM => {
			// Start of code changes done for CMW_Enhanc_07 - Custom LAM Fields
			// pageProxy.setActionBinding(LAM.getItem(0)); // Commented
			// return context.read('/SAPAssetManager/Services/OnlineAssetManager.service', `ZLamGeos(zObjectType='${LAM.getItem(0).ObjectType}',zTableKey='${LAM.getItem(0).TableKey}')`, [] ).then(zLAM => {
			gLAM = LAM
			// return context.read('/ZSAPASSETMGRMTADTA_2210/Services/OnlineAssetManager.service', `ZLamGeos(zObjectType='${LAM.getItem(0).ObjectType}',zTableKey='${LAM.getItem(0).TableKey}')`, [] ).then(xLAM => {
			return context.read('/ZSAPASSETMGRMTADTA_2210/Services/AssetManager.service',`ZGeoInfoSet(zObjectType='${LAM.getItem(0).ObjectType}',zTableKey='${LAM.getItem(0).TableKey}')`, []).then(xLAM => {
				let clonedLAMData = JSON.parse(JSON.stringify(gLAM.getItem(0))),
				zLAM = xLAM.getItem(0);
				clonedLAMData['zHeight'] = zLAM.zHeight;
				clonedLAMData['zHeight1'] = zLAM.zHeight1;
				clonedLAMData['zLongitude1'] = zLAM.zLongitude1;
				clonedLAMData['zLongitude'] = zLAM.zLongitude;
				clonedLAMData['zLatitude'] = zLAM.zLatitude;
				clonedLAMData['zLatitude1'] = zLAM.zLatitude1;
				// clonedLAMData['zDataSource'] = zLAM.zDataSource;
				// cloneLAMData['zPrecision'] = zLAM.zPrecision;
				pageProxy.setActionBinding(clonedLAMData);
				// End of code changes done for CMW_Enhanc_07 - Custom LAM Fields
				return context.executeAction('/SAPAssetManager/Actions/LAM/LAMDetailsNav.action');
			// Start of code changes done for CMW_Enhanc_07 - Custom LAM Fields
			}, error => {
				Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryLAM.global').getValue(), error);
			});
			// End of code changes done for CMW_Enhanc_07 - Custom LAM Fields
		}, error => {
			/**Implementing our Logger class*/
			Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryLAM.global').getValue(), error);
		});
}