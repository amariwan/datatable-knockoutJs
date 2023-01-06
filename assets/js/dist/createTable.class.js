/* It creates a table with a search input for each column and sort a Data. */
class createTable {
	constructor(params) {
		var self = this;
		var log = console.log;
		self.classID = params.classID;
		self.url = params.url;
		/* Used to update the rows in the table. */
		self.updateRows = params.updateRows; // why dont used observable besause it's a callback Func
		self.getPropertys = params.getPropertys;
		self.foundProperty = params.foundProperty;
		self.rowsEntries = params.rowsEntries;
		self.selectedRows = params.selectedRows;
		/* Setting the loading to true or false. */
		self.isLoading = ko.observable(params.isLoading);
		/* Creating a new array with the columns and Backup Data. */
		self.paramColumns = ko.observableArray(params.columns);
		self.paramColumns_test = ko.observableArray(self.paramColumns());
		/* Creating a new array with the data. and Backup Data */
		self.paramData = ko.observableArray(params.data);
		/* Used to update the rows in the table. */
		self.updatePramColumns = ko.observableArray(params.column);
		self.updateParamData = ko.observableArray(params.data);
		/* Setting the fieldKey to the params.fieldKey or to the string 'field'. */
		self.paramFieldKey = ko.observable(params.fieldKey || 'field');
		/* Setting the displayNameKey to the params.displayNameKey or to the string 'displayName'. */
		self.paramDisplayNameKey = ko.observable(params.displayNameKey || 'displayName');
		/* Used to sort the data by starting an application. */
		self.paramSort = ko.observable(self.paramColumns()[0].text);
		self.isFolded = ko.observable(true);
		/* Search for a specific value in a nested object and return the key path
		 An observable that is used to store the search text. */
		self.searchTxt = ko.observable();
		/* An observable array that is used to store the search text. */
		self.searchLst = ko.observableArray([]);
		/* Used to store the search text. */
		self.searchTxtLst = ko.observableArray([]);

		self.sortClass = ko.observable('sorting');

		/* Used to update the loading percentage. */
		// self.loading = (i, length = self.rowsLength()) => {
		// 	var percent;
		// 	percent = ((i / length) * 100).toFixed(0);
		// 	if (i == 0 || i > length || ++i == length) {
		// 		percent = 100;
		// 	}
		// 	self.readLoadingPerecent(percent);
		// };

		/* A function that is used to search in a nested object. */
		self.search = (searchTxt, property) => {
			return new Promise((resolve) => {
				log(searchTxt, property, self.selectedRows(), self.updateParamData());
				/* Setting the lst to the paramData because have to backup a Data */
				var lst = self.updateParamData();
				var item = {
					Text: searchTxt,
					Property: property,
				};
				/* Checking if the property is already in the list. */
				var isPropertyAlready = self.searchLst().some((item) => item.Property === property);
				/* Checking if the search text is not empty and the property is not null and the property is not 0
				and the property is not true. */
				if (searchTxt != '' && property.length != null && property.length > 0 && isPropertyAlready == false) {
					self.searchLst.push(item);
				} else if (searchTxt == '' && searchTxt.length == 0) {
					/* Checking if the search text is empty and the length of the search text is 0. */
					var array = self.removeItemByKey(self.searchLst(), 'Property', item.Property); // Removing an item from an array by key.
					self.searchLst(array);
				} else {
					// Removing the item from the array and then adding it again.

					var array = self.removeItemByKey(self.searchLst(), 'Property', item.Property); // Removing an item from an array by key.
					self.searchLst(array);
					self.searchLst.push(item);
				}
				/* Checking if the search list is greater than 0. */
				if (self.searchLst().length > 0 && self.selectedRows().length == 0) {
					lst = self.searchNow(self.paramData(), self.searchLst());
				} else if (self.searchLst().length > 0 && self.selectedRows().length > 0) {
					lst = self.searchNow(self.updateParamData(), self.searchLst());
					log(lst, '81', self.updateParamData());
				} else {
					/* Setting the lst to the paramData. */
					// if (self.selectedRows)
					lst = self.paramData();
				}
				if (lst.length == 0) {
					notif('warning', 'Search', 'not found Data', true);
					resolve(self.updateParamData());
				} else resolve(lst);
			});
		};

		self.searchNow = (lst, searchLst) => {
			log(lst, searchLst);
			for (let i = 0; i < searchLst.length; i++) {
				const element = searchLst[i];
				/* Searching in a nested object. */
				lst = self.filterNode(lst, element.Property, element.Text);
			}
			return lst;
		};

		var canSplit = function (str, elements) {
			var lst = {
				methor: [],
				str: [],
			};
			for (var i = 0; i < elements.length; i++) {
				if ((str || '').split(elements[i]).length > 1) {
					lst.methor.push(elements[i]);
					lst.str.push(str);
				}
			}
			lst;
		};
		// var splitOrig = String.prototype.split; // Maintain a reference to inbuilt fn
		// String.prototype.split = function () {
		// 	if (arguments[0].length > 0) {
		// 		if (Object.prototype.toString.call(arguments[0]) == '[object Array]') {
		// 			// Check if our separator is an array
		// 			return splitMulti(this, arguments[0]); // Call splitMulti
		// 		}
		// 	}
		// 	return splitOrig.apply(this, arguments); // Call original split maintaining context
		// };
		// var a = 'a=b,c:d';
		// a.split(['=', ',', ':']);
		/* A function that is used to search in a nested object. */
		self.filterNode = function (nodes, parts, searchText) {
			var lst = [];
			parts = parts.split('.');
			// log(canSplit(searchText, ['|', '<', '>']), 'sp');
			searchText = searchText.split('&');
			// searchText = searchText.split('<');
			// searchText = searchText.split('<');
			if (typeof nodes == 'undefined' && typeof nodes != 'object') {
				console.error('nodes is not an object');
				return;
			}
			for (let k = 0; k < nodes.length; k++) {
				const e = nodes[k];
				/* Getting the keys of the object. */
				let keys = Object.keys(e);
				var x = 0;
				for (let i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (typeof key == 'object') {
						if (typeof keys[i] == 'object') {
							let sublst = self.filterNode(e[keys[i]], parts[x], searchText);
							// if (sublst != null) {
							// 	sublst.forEach((x) => {
							// 		lst.push(x);
							// 	});
							// }
						}
					} else {
						if (key == parts[x]) {
							var lNode = typeof e[key] == 'object' ? e[key].value : e[key];
							if (lNode == null) {
								if (self.searchInSubNode(lNode, searchText, parts, x)) {
									lst.push(e);
								}
							} else {
								if (typeof searchText == 'string') {
									if (self.searchInNode(lNode, searchText)) {
										lst.push(e);
									}
								} else {
									searchText.forEach((element) => {
										if (self.searchInNode(lNode, element)) {
											lst.push(e);
										}
									});
								}
							}
						}
					}
				}
			}
			return lst;
		};

		// Search in a subnode
		/* Searching in a nested object. */
		self.searchInSubNode = (items, searchText, parts, x) => {
			log(items);
			if (items != null) {
				++x;
				for (let y = 0; y < items.length; y++) {
					const element = items[y];
					var lNodeText = element[parts[x]];
					if (lNodeText != null && typeof lNodeText == 'string') {
						lNodeText = lNodeText.toLowerCase();
						if (lNodeText.includes(searchText)) {
							return true;
						}
					} else if (typeof lNodeText == 'object') {
						if (self.searchInSubNode(lNodeText, searchText, parts, x)) {
							return true;
						}
					}
				}
			}
			return false;
		};

		/* This function is used to search in a nested object. */
		self.searchInNode = function (item, searchText) {
			item = String(item);
			/* Converting the item to lower case. */
			item = item.toLowerCase();
			/* Checking if the searchText is in the item. */
			if (item.includes(searchText.toLowerCase())) {
				return true;
			}
			return false;
		};

		self.searchTimeout = null;

		self.koColumnHeaders = (columns) => {
			return new Promise((resolve) => {
				if (columns == null) {
					return;
				}
				self.updatePramColumns(columns);
				/* Creating a new array with the columns and the searchInput. */
				var columnHeaders = [];
				columns.forEach((column) => {
					column = column.text;
					columnHeaders.push({
						field: column,
						displayName: column,
						class: column,
						/* Sorting the data. */
						cleanSearchArray: async () => {
							self.searchLst.removeAll();
							self.searchTxt('');
							self.updateParamData(await self.koRows(self.paramData()));
							self.updateRows(self.updateParamData(), false);
							$('.isCanClearnSearchInput' + self.classID()).addClass('hidden');
							$('.searchInput' + self.classID()).val('');
						},
						fold: async () => {
							self.fold(column);
							/* Setting the sort to the column. */
							self.paramSort(column);
							/* Updating the rows in the table. */
							self.updateRows(await self.koRows(self.updateParamData()), false);
							self.foundProperty();
						},
						sortClass: self.sortClass,
						// It searches for data in a database and then updates the rows in a table.
						searchInput: ko.pureComputed({
							read: function () {
								return '';
							},
							/* A function that is used to search in a nested object. */
							write: function (Text) {
								log(Text);
								let fn = async () => {
									$('.isCanClearnSearchInput' + self.classID()).removeClass('hidden');
									/* Searching in the data. */
									self.updateParamData(await self.search(Text, column));
									/* Checking if the data is empty. If it is empty then it is setting the loading to false. */
									if (self.updateParamData().length == 0) {
										self.isLoading(false);
									}
									/* Updating the rows. */
									self.updateRows(await self.koRows(self.updateParamData()), false);
								};
								/* Used to clear the timeout. */
								if (self.searchTimeout != null) {
									clearTimeout(self.searchTimeout);
								}
								/* wait for 500ms. */
								self.searchTimeout = setTimeout(fn, 500);
								self.foundProperty();
							},
							owner: this,
						}),
					});
				});
				resolve(columnHeaders);
			});
		};
		self.istableOpen = ko.observable(false);

		// Creating a new array with the Rows
		self.koRows = (data) => {
			if (data == null) {
				return;
			}
			return new Promise(async (resolve) => {
				var columns = self.paramColumns();
				var rows = [];
				data = data.slice(0, self.rowsEntries()) || self.paramData().slice(0, self.rowsEntries()); // Limiting the amount of data to 100
				if (data.length === 0) return notif('warning', 'Search', 'not found Data', true);
				if (typeof data[0].cells === 'object') {
					self.sort(data, self.isFolded() ? self.sortA_Z : self.sortZ_A);
					return data;
				}
				// Sorting the data.
				self.sort(data, self.isFolded() ? self.sortA_Z : self.sortZ_A);
				// Creating a new array with the columns
				data.forEach((datum) => {
					var row = {
						cells: [],
						columns: [],
						class: [],
						edit: [],
						refresh: '',
						isSelectedRows: ko.observable(false),
					};
					columns.forEach((column) => {
						column = column.text;
						if (datum[column] == undefined) {
							datum[column] = ' ';
						}
						if (typeof datum[column] === 'object') {
							row.cells.push(datum[column].value);
							row.edit.push(() => {
								if (datum[column].key != 'false') {
									if (self.istableOpen() != true) {
										log(datum[column].key);
										self.getKey(datum[column].key, false);
									} else {
										self.getKey(datum[column].key, true);

										log('close Table');
									}
								} else {
									log(datum[column].key, ' lol');
								}
							});
							row.refresh = () => {
								console.log(datum);
							};
						} else {
							// Set the variable d to the value of the column in the datum.
							var value = datum[column];
							row.cells.push(value);
							row.edit.push(() => {
								console.log('edit', value);
							});
						}
						row.columns.push(column);
						row.class.push(self.foundProperty(column) ? column : column + ' hidden');
					});
					rows.push(row);
				});
				resolve(rows);
			});
		};

		self.saveRows = (rows) => {
			return '';
			self.updateParamData(rows);
			return self.updateParamData();
		};
		/* Used to sort the data. */
		self.fold = (value) => {
			let isF = self.isFolded();
			/* Checking if the value is the same as the paramSort. */
			if (value == self.paramSort()) {
				self.isFolded(!isF);
			} else {
				self.isFolded(true);
			}
		};

		/* A function that is used to sort the data. */
		self.sortA_Z = (x, y) => {
			var paramSort = self.paramSort();
			self.sortClass('sorting_asc');
			var resolve = false;
			if (typeof x[paramSort] == 'object' && typeof y[paramSort] == 'object') resolve = x[paramSort].value > y[paramSort].value;
			else resolve = x[paramSort] > y[paramSort];
			return resolve;
		};

		/* A function that is used to sort the data. */
		self.sortZ_A = (x, y) => {
			var paramSort = self.paramSort();
			self.sortClass('sorting_de');
			var resolve = false;
			if (typeof x[paramSort] == 'object' && typeof y[paramSort] == 'object') resolve = x[paramSort].value < y[paramSort].value;
			else resolve = x[paramSort] < y[paramSort];
			return resolve;
		};

		// Sortiert die Daten.
		self.sort = (liste, fnSort) => {
			while (true) {
				var i = 0;
				var fertig = true;
				while (i < liste.length - 1) {
					var zahl1 = liste[i];
					var zahl2 = liste[i + 1];
					if (fnSort(zahl1, zahl2)) {
						liste[i] = zahl2;
						liste[i + 1] = zahl1;
						fertig = false;
					}
					i++;
				}
				if (fertig) {
					break;
				}
			}
		};

		/* Removing an item from an array by key. */
		self.removeItemByKey = (array, key, value) => {
			var i = 0;
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

		// create check list
		self.checkList = (data) => {
			var list = [];
			for (var i in data) {
				var datum = data[i];
				for (var j in datum) {
					var column = datum[j];
					if (column == undefined) {
						datum[j] = i;
					}
					if (typeof column === 'object') {
						list.push(column.value);
					} else {
						list.push(column);
					}
				}
			}
			return list;
		};

		//-------------------------------------------------------
		// || ======== 🚧👨‍🔧*** I'm not done  ***👨‍🔧🚧 ========= ||
		//-------------------------------------------------------

		self.getKey = async (key, doReset) => {
			log(key, doReset);
			var data = await connectToServer(self.url.sub, 'post', true, key);
			log(data.type[0]);
			if (data.type[0] == 'table') {
				self.createSubTable(data);
			} else if (data.type[0] == 'form') {
				self.createForm(data);
				console.log('form');
			} else {
				console.log('error');
			}
		};

		self.Tabledestroy = () => {
			console.log('destroy');
			$('.TableSub').addClass('hidden');
			$('#separator').addClass('hidden');

			self.istableOpen(false);
		};
		//
		//
		//
		var TableSub = document.getElementById('TableSub');
		self.createSubTable = async (data) => {
			if (!(await _tableVM.init(data))) {
				console.log('error');
				notif('error', 'server', 'not found Data', false);
				self.istableOpen(false);
				return;
			} else {
				$('.TableSub').removeClass('hidden');
				$('#separator').removeClass('hidden');
				$('.button-table-open').removeClass('hidden');
				if (localStorage.getItem('isTableSubOpen') === 'false') {
					ko.applyBindings(_tableVM, TableSub);
					localStorage.setItem('isTableSubOpen', 'true');
					console.log(localStorage.getItem('isTableSubOpen'));
				}
			}
		};

		//
		//
		//

		// self.autoCreateForm = async () => {
		// 	var body = { objtype: 'srvReqKey', key: 'spf_TableFormFuerAland(10003)' };
		// 	var data = await self.connectToServer(self.url.sub, 'post', true, body);
		// 	self.createForm(data);
		// };
		// self.autoCreateForm();

		var TableForm = document.getElementById('TableForm');
		self.createForm = async (data) => {
			if (!(await _tableFormVM.init(data))) {
				console.log('error');
				notif('error', 'server', 'not found Data', false);
				$('.TableForm').addClass('hidden');
				return;
			} else {
				$('.TableForm').removeClass('hidden');
				if (localStorage.getItem('isTableForm') === 'false') {
					ko.applyBindings(_tableFormVM, TableForm);
					localStorage.setItem('isTableForm', 'true');
				}
			}
		};
	}
}
