import {
	CoreTypes
} from '@nativescript/core';
// Start of code changes done for CMW_Enhanc_01 - Current Location
// import appSettings from '../../SAPAssetManager/Rules/Common/Library/ApplicationSettings';
// import ApplicationSettings from '@nativescript/core';
// End of code changes done for CMW_Enhanc_01 - Current Location
import * as geolocation from '@nativescript/geolocation';
/**
 * Describe this function...
 * @param {IClientAPI} clientAPI
 */
export default function GetCurrentLocation(clientAPI) {
	return geolocation.getCurrentLocation({
		desiredAccuracy: CoreTypes.Accuracy.high,
		maximumAge: 5000,
		timeout: 10000,
	}).then((loc) => {
		if (loc) {
			let geoJson = {
				'type': 'Feature',
				'geometry': {
					'type': 'Point',
					'coordinates': [],
				},
				'properties': null,
			};
			geoJson.geometry.coordinates.push([loc.latitude, loc.longitude]);
			// Start of code changes done for CMW_Enhanc_01 - Current Location
			clientAPI.nativescript.appSettingsModule.setString('Lattitude', loc.latitude.toString());
			clientAPI.nativescript.appSettingsModule.setString('Longitude', loc.longitude.toString());
			// appSettings.setString(clientAPI,'Lattitude',loc.latitude.toString());
			// appSettings.setString(clientAPI,'Longitude',loc.longitude.toString());
			// appSettings.setString("Lattitude",loc.latitude.toString());
			// appSettings.setString("Longitude",loc.longitude.toString());
			// return Promise.resolve(geoJson); // Commented
			return Promise.resolve(loc.latitude + ", " + loc.longitude);
			// End of code changes done for CMW_Enhanc_01 - Current Location
		} else {
			// location not found
			return Promise.resolve();
		}
	}, () => {
		// errors
		return Promise.resolve();
	});
}