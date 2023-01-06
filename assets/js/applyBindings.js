// they must be outside of "document.ready", because the veriable must be static
// the API URL of the backend is entered here to retrieve the data
localStorage.setItem('isTableForm', 'false');
localStorage.setItem('isTableSubOpen', 'false');
const url = {
	main: 'https://192.168.44.185:4000/',
	sub: 'https://192.168.44.185:4000/sub',
};
var _tableFormVM = new tableForm();
var _tableVM = new tableVM(url, '_sub');
var data = await connectToServer(url.main, 'get', true, { secure: 'unsicher', objtype: 'srvReqLxwStapel', reqobj: ' { objtype: "srvFilter", filter: [{ name: "limit", value: "1000" }] }', sessionUID: '87888d63-cb3f-458e-ab05-9ba4369c4073' });
document.addEventListener('DOMContentLoaded', () => {
	const id = '_index';
	const loadingData = async () => {
		var _tableVM = new tableVM(url, id);
		/* Checking if the function `aktionenClassVM.init()` returns false. */
		if (!(await _tableVM.init(data))) {
			console.log('error');
			return;
		}

		/* Binding the view model to the HTML element with the id "Table". */
		ko.applyBindings(_tableVM, document.getElementById('Table'));
	};
	loadingData();
});
