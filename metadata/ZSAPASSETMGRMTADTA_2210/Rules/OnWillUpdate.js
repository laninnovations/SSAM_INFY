export default function OnWillUpdate(clientAPI) {
	return clientAPI.executeAction('/ZSAPASSETMGRMTADTA_2210/Actions/OnWillUpdate.action').then((result) => {
		if (result.data) {
			return Promise.resolve();
		} else {
			return Promise.reject('User Deferred');
		}
	});
}