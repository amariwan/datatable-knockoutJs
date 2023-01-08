class tableForm {
	constructor() {
		const self = this;
		const log = console.log;
		self.nodes = ko.observableArray();
		self.saveInputFormLst = ko.observableArray();
		self.ischanged = ko.observable(false);
		self.msg = ko.observable('Info msg');
		//-------------------------------------------------------
		// || ======== *** getNodes *** ========= ||
		//-------------------------------------------------------
		/* A function that returns an array of Nodes. */
		self.getNodes = async (obj) => {
			return new Promise((resolve) => {
				var results = [];
				var item;
				/* Looping through the object and getting the keys. */
				Object.keys(obj).forEach((key) => {
					var value = obj[key];
					Object.keys(value).forEach((key) => {
						/* Getting the properties of the json object. */
						if (typeof value !== 'object' && !results.includes(key)) {
							// results.push(key);
						} else if (typeof value === 'object') {
							if (value != undefined && value != null) {
								item = {
									index: results.length,
									text: key,
									value: value[key].value,
									searchInput: self.x,
								};
								const found = results.some((item) => item.text === key);
								if (!found) {
									results.push(item);
								}
							}
						}
					});
				});
				console.log(results);
				resolve(results);
			});
		};
		self.x = ko.pureComputed({
			read: function () {
				return '';
			},
			/* A function that is used to search in a nested object. */
			write: function (Text) {
				log(Text);
				self.ischanged(true);
			},
			owner: this,
		});
		//-------------------------------------------------------
		// || ======== *** INIT *** ========= ||
		//-------------------------------------------------------
		/* A function that is called when the data is loaded. */
		self.init = async (data) => {
			try {
				if (data == null) data = await connectToServer(url.index, 'get', true, null);
				data = data.data;
				data = await self.getNodes(data);
				self.nodes(data);
				// self.nodes.push(data);
				// self.nodes.push(data);
				log(self.nodes());
				// var TableForm = document.getElementById('TableForm');
				// var TableForm_content = document.createElement('div');
				// TableForm_content.setAttribute('class', 'TableForm-content');
				// TableForm_content.innerHTML =
				// 	"<div class='title d-inline-flex justify-content-between' > <div class='title-contant'>Form</div><div class='btn-close' data-bind='click:btnCloseForm'></div></ ><div class='body'><div class='main' data-bind='foreach: nodes'><div class='inputBox'><span data-bind='text:text'></span><input type='text' data-bind=' attr: {placeholder: value},value: value, textInput: searchInput, valueUpdate:'keyup''></div></div></div><div class='footer'><div>Info messeger</div><div><button class='btn-close' data-bind='click:closeForm'>no ok</button><button class='btn-ok' data-bind='click:btnSusForm'>ok</button></div></div>";
				// TableForm.appendChild(TableForm_content);

				return true;
			} catch (ex) {
				/* Catching an exception. */
				console.error(ex);
				notif('error', 'server', 'check server connection  ' + JSON.stringify(ex), false);
				return false;
			}
		};

		self.btnCloseForm = () => {
			if (self.ischanged()) {
				notif('warning', 'info', 'u changed input', true);
			} else {
				$('.TableForm').addClass('hidden');
			}
			// $('.TableForm-content').remove();
			log('ggexit');
		};
		self.closeForm = () => {
			log('kkexit');
			if (self.ischanged()) {
				notif('info', 'info', 'u changed input', false);
				notif('warning', 'info', 'u changed input', false);
				notif('error', 'info', 'u changed input', false);
				notif('success', 'info', 'u changed input', false);
			} else {
				$('.TableForm').addClass('hidden');
			}
		};

		self.btnSusForm = () => {
			return new Promise((resolve) => {
				var items = [];
				self.nodes().forEach((item) => {
					items[item.text] = item.value;
				});
				resolve(items);
				self.ischanged(false);
				$('.TableForm').addClass('hidden');
				console.log(items);
			});
		};

		/* Removing an item from an array by key. */
		self.removeItemByKey = (array, key, value) => {
			var i = 0;
			log(array, key, value);
			/* Checking if the i is less than the length of the array. */
			while (i < array.length) {
				/* Checking if the array[i][key] is equal to the value. */
				if (array[i][key] === value) {
					array.splice(i, 1);
				} else {
					++i;
				}
			}
			return array;
		};
	}
}
