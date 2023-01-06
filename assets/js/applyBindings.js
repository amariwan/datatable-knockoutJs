// they must be outside of "document.ready", because the veriable must be static
// the API URL of the backend is entered here to retrieve the data
localStorage.setItem('isTableForm', 'false');
localStorage.setItem('isTableSubOpen', 'false');

var _tableFormVM = new tableForm();
var _tableVM = new tableVM(url, '_sub');
document.addEventListener('DOMContentLoaded', async () => {
	var data = await connectToServer('get', '');
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
