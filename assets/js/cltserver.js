// This function can lead to errors

const url = {
	main: 'https://192.168.44.185:4000/',
	sub: 'https://192.168.44.185:4000/sub',
};
connectToServer = async (url, type, async, body) => {
	console.log(url, type, async, body);
	return new Promise((resolve, reject) => {
		$.ajax({
			url: url,
			type: type,
			async: async,
			data: body,
			success: async (data) => {
				console.log(data);
				if (data == null || typeof data == 'string' || Object.keys(data).length == 0 || data.length === 'undefined') {
					reject('error: ' + JSON.stringify(data));
					notif('error', 'server', 'check server connection  ' + JSON.stringify(data), false);
				} else {
					var x = Object.keys(data);
					data = data[x];
					x = Object.keys(data);
					data = data[x];
					x = Object.keys(data);
					data = JSON.parse(data[x]);
					x = Object.keys(data);
					data = data[x];
					console.log({ data: data, type: x });
					resolve({ data: data, type: x });
				}
			},
			error: (error) => {
				notif('error', 'server', 'check server connection  ' + JSON.stringify(error), false);
				reject(error);
			},
		});
	});
};
