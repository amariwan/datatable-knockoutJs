class tableVM {
	constructor(url, classID) {
		var self = this;
		var log = console.log;
		self.classID = ko.observable(classID);
		log(self.classID());
		/* An observableArray that is used to store the data. */
		self.nodes = ko.observableArray([]);
		/* Used to update the rows in the table. */
		self.UpdateNodes = ko.observableArray([]);
		/* A boolean value that is used to show or hide the loading animation. */
		self.isLoading = ko.observable(true);
		/* An observableArray that is used to store the data. */
		self.aktionName = ko.observableArray([]);
		/* An observableArray that is used to store the data. */
		self.propertys = ko.observableArray([]);
		self.updatePropertys = ko.observableArray([]);
		/* An observableArray that is used to store the selected properties. */
		self.selectedPropertys = ko.observableArray([]);
		/* Used to store the data. */
		self.columns = ko.observableArray([]);
		/* Used to limit the amount of times the rows are updated. */
		self.rows = ko.observableArray([]).extend({ rateLimit: 50 });
		/* Used to store the data. */
		self.backUpRows = ko.observableArray([]);
		/* Used to hide the columns. */
		self.isSelectedShow = ko.observable(true);
		self.cleanSearchArray;
		self.table;
		self.rowsEntries = ko.observable();

		//-------------------------------------------------------
		// || ======== *** getProperty *** ========= ||
		//-------------------------------------------------------
		/* A function that returns an array of properties. */
		self.getProperty = async (obj) => {
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
									value: results.length,
									text: key,
								};
								const found = results.some((item) => item.text === key);
								if (!found) {
									results.push(item);
								}
							}
						}
					});
				});
				resolve(results);
			});
		};
		//-------------------------------------------------------
		// || ======== *** INIT *** ========= ||
		//-------------------------------------------------------

		/* A function that is called when the data is loaded. */
		self.init = async (data) => {
			try {
				if (data == null) return false;
				// if (typeof data == 'string' || data.length <= 0) {
				// 	console.error('error: ' + data);
				// }
				data = data.data;
				self.nodes(data);
				/* Getting the properties of the json object. */
				var propertysLst = await self.getProperty(data);
				/* Setting the value of the observableArray. */
				self.propertys(propertysLst);
				self.updatePropertys(propertysLst);
				/* Creating the table. */
				self.createTable(data, propertysLst);
				/* Used to set the selectedPropertys observableArray to the propertys observableArray. */
				self.selectedPropertys(self.propertys.slice(0)); // Don't ask me why I used Slice, I don't know either.
				return true;
			} catch (ex) {
				/* Catching an exception. */
				console.error(ex);
				notif('error', 'server', 'check server connection  ' + JSON.stringify(ex), false);
				return false;
			}
		};

		//-------------------------------------------------------
		// || ======== *** Creating a table *** ========= ||
		//-------------------------------------------------------
		self.createTable = async (nodes, propertys) => {
			if (propertys.length == 0) {
				nodes = [];
				$('.table' + self.classID()).addClass('hidden');
				self.isLoading(false);
			}
			if (nodes == null) {
				$('.table' + self.classID()).addClass('hidden');
				self.isLoading(false);
			}
			$('.table' + self.classID()).removeClass('hidden');
			// Create Table
			/* Creating a new instance of the createTable class. */
			self.table = new createTable({
				data: nodes,
				columns: propertys,
				updateRows: self.updateRows,
				isLoading: self.isLoading,
				getPropertys: self.getProperty,
				foundProperty: self.foundProperty,
				rowsEntries: self.rowsEntries,
				selectedRows: self.selectedRows,
				classID: self.classID,
				url: url,
			});
			/* Creating the table headers. */
			self.columns(await self.table.koColumnHeaders(propertys));
			self.cleanSearchArray = self.columns()[0].cleanSearchArray;
			/* Calling the koRows function and passing the nodes. */
			self.backUpRows(await self.table.koRows(nodes));
			self.rows(self.backUpRows());
		};

		/* A function that is called when the rows are updated. */
		self.updateRows = async (rows, saveOnCreateTable) => {
			if (rows.length == 0) {
				notif('warning', 'Search', 'not found Data', true);
				$('.loading' + self.classID()).addClass('hidden');
				return;
			}
			$('.loading' + self.classID()).removeClass('hidden');
			$('.table' + self.classID()).removeClass('hidden');

			/* Updating the rows observableArray. */

			if (saveOnCreateTable) {
				self.table.updateParamData(rows);
				self.rows(await self.table.koRows(rows));
			} else {
				self.rows(rows);
			}
			self.hiddenColumns(self.selectedPropertys());
		};
		//-------------------------------------------------------
		// || ======== *** selectedAllPropertys *** ========= ||
		//-------------------------------------------------------
		/* A computed observable that is called when the selectedPropertys changes. */
		self.selectedAllPropertys = ko.pureComputed({
			read: function () {
				/* Calling the createTable function and passing the nodes and selectedPropertys. */

				self.hiddenColumns(self.selectedPropertys());
				/* Checking if the selectedPropertys length is equal to the propertys length. */
				/* Checking if the selectedPropertys observableArray is empty. And Setting the isLoading observable to true or false. */
				if (self.selectedPropertys().length == 0) {
					self.isLoading(false);
					$('.table' + self.classID()).addClass('hidden');
					self.hiddenColumns(self.selectedPropertys());
				} else {
					self.isLoading(true);
					$('.table' + self.classID()).removeClass('hidden');
				}
				return self.selectedPropertys().length === self.propertys().length;
			},
			/* A computed observable that is called when the selectedPropertys changes. */
			write: function (value) {
				/* Setting the selectedPropertys observableArray to the propertys observableArray. */
				self.selectedPropertys(value ? self.propertys.slice(0) : []);
			},
			/* A reference to the object that owns the computed observable. */
			owner: this,
		});

		self.hiddenColumns = (x) => {
			var propertys = self.propertys();
			var selectedPropertys = x || self.selectedPropertys();
			var results = [];
			for (let i = 0; i < propertys.length; i++) {
				var property = propertys[i].text;
				if (!self.foundProperty(property, selectedPropertys)) {
					$('.' + property + self.classID()).addClass('hidden');
					log(property);
				} else {
					$('.' + property + self.classID()).removeClass('hidden');
				}
			}
		};
		self.foundProperty = (property, selectedPropertys) => {
			selectedPropertys = selectedPropertys || self.selectedPropertys();
			for (let j = 0; j < selectedPropertys.length; j++) {
				var selectedProperty = selectedPropertys[j].text;
				if (selectedProperty == property) {
					return true;
				}
			}
			return false;
		};

		//-------------------------------------------------------
		// || ======== *** SelectedRows *** ========= ||
		//-------------------------------------------------------
		self.showSelectedRowstxt = ko.observable('👀');
		self.showSelectedRowstit = ko.observable('');
		/* A function that is called when a button is clicked. */
		self.showSelectedRows = () => {
			let isF = self.isSelectedShow();
			var item = self.createRows(self.selectedRows());
			/* Checking if the value is the same as the paramSort. */
			// self.updateTable(self.selectedPropertys(), item);
			if (isF) {
				self.isSelectedShow(!isF);
				self.showSelectedRowstxt('🚫');
				self.showSelectedRowstit('show All');
				self.updateRows(item, true);
			} else {
				self.showSelectedRowstxt('👀');
				self.showSelectedRowstit('show Selected Rows');
				self.isSelectedShow(true);
				self.updateRows(self.table.paramData(), true);
			}
		};

		/* Creating a new observable property called isSelectedAllRowsChecked and setting it to false. */
		self.isSelectedAllRowsChecked = ko.observable(false);

		self.selectedRows = ko.observableArray([]);
		self.selectedRowsEvent = ko.pureComputed({
			read: function () {
				if (self.selectedRows().length === 0) {
					$('.isCanShowSelectedRows').addClass('hidden');
					return;
				} else {
					$('.isCanShowSelectedRows').removeClass('hidden');
				}
				return self.isSelectedAllRows(self.rows(), self.selectedRows());
			},
			write: function (value) {
				if (value) {
					if (self.selectedRows().length > 0) {
						for (let i = 0; i < self.selectedAllRows().length; i++) {
							var element = self.selectedAllRows()[i];
							var found = self.selectedRows().some((item) => item === element);
							if (!found) {
								self.selectedRows.push(element);
							}
						}
					} else {
						self.selectedRows(self.selectedAllRows());
					}
				} else {
					self.selectedRows(self.arrayRemoveByitems(self.selectedRows(), self.rows()));
				}
			},
			owner: this,
		});

		/* Removing all the selected rows from the table. */
		self.cleanSelectedRows = () => {
			self.selectedRows.removeAll();
			// self.updateRows(self.backUpRows());
		};

		/* Comparing two arrays and returning true if they are equal. */
		self.isSelectedAllRows = (array1, array2) => {
			var lst = [];
			for (let i = 0; i < array1.length; i++) {
				var element1 = array1[i].cells;
				element1 = element1.toString();
				for (let j = 0; j < array2.length; j++) {
					var element2 = array2[j];
					if (element1 === element2) {
						lst.push(element1);
					}
				}
			}
			return lst.length === array1.length;
		};
		/* Creating a list of all the rows in the table. */
		self.selectedAllRows = () => {
			var lst = [];
			for (var i = 0; i < self.rows().length; i++) {
				var e = self.rows()[i].cells;
				e = e.join();
				lst.push(e);
			}
			return lst;
		};
		self.createRows = (selectedRows) => {
			if (typeof selectedRows === 'undefined') {
				return [];
			}
			var lst = [];
			for (var i = 0; i < selectedRows.length; i++) {
				var rows = selectedRows[i];
				rows = rows.split(',');
				var row = {};
				for (var j = 0; j < self.propertys().length; j++) {
					var property = self.propertys()[j].text;
					row[property] = rows[j];
				}
				lst.push(row);
				log(lst);
			}
			return lst;
		};

		//-------------------------------------------------------
		// || ======== *** getJson *** ========= ||
		//-------------------------------------------------------
		/* A function that is used to load the json files. */
		self.getJson = (path) => {
			return new Promise((resolve) => {
				/* Loading the json files. */
				$.getJSON(path, (data) => {
					resolve(data);
				});
			});
		};
		//-------------------------------------------------------
		// || ======== *** arrayRemoveByitems *** ========= ||
		//-------------------------------------------------------
		// Removing multiple items
		self.arrayRemoveByitems = (arr, items) => {
			var lst = [];
			for (let j = 0; j < items.length; j++) {
				var item = items[j].cells.toString();
				lst.push(item);
			}
			var result = arr.filter((item) => !lst.includes(item));
			return result;
		};

		//-------------------------------------------------------
		// || ======== *** getAllValuesByKey *** ========= ||
		//-------------------------------------------------------
		/* A function that is used to get all the values of an object. */
		self.getAllValuesByKey = (object) => {
			var lst = [];
			/* Getting the values of the object. */
			object.forEach((e) => {
				lst.push(e.value);
			});
			return lst;
		};
		//-------------------------------------------------------
		// || ======== *** DataTablesExport *** ========= ||
		//-------------------------------------------------------
		self.fileName = ko.observable('DataTablesExport');
		$('.DLtoExcel' + self.classID()).click(() => {
			alert('Handler for .click() called.');
		});
		$('.DLtoExcel' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'xls',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});
		$('.DLtoTxt' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'txt',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});
		$('.DLtoJson' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'json',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});
		$('.DLtoXml' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'xml',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});
		$('.DLtoSql' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'sql',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});

		$('.DLtoDoc' + self.classID()).on('click', () => {
			console.log('start');
			$('.table' + self.classID()).tableExport({
				type: 'doc',
				fileName: self.fileName(),
				postCallback: () => {
					console.log('done loading my humugoid file');
				},
			});
		});
		//-------------------------------------------------------
		// || ======== *** checkList *** ========= ||
		//-------------------------------------------------------

		self.checkList1 = () => {
			log('ck');
			$('.checkList1' + self.classID()).toggleClass('visible');
		};
		self.checkList2 = () => {
			log('ck');

			$('.checkList2' + self.classID()).toggleClass('visible');
		};
		// var checkList2 = document.getElementById('list2' + self.classID());
		// checkList2.onclick = function (evt) {
		// 	if (checkList2.classList.contains('visible')) checkList2.classList.remove('visible');
		// 	else checkList2.classList.add('visible');
		// };
		$(document).on('click', (event) => {
			var $trigger = $('.dropdown');
			if ($trigger !== event.target && !$trigger.has(event.target).length) {
				$('.dropdown-check-list').removeClass('visible');
			}
		});
		//-------------------------------------------------------
		// || ======== *** openOrCloseTable *** ========= ||
		//-------------------------------------------------------
		self.openOrCloseTable = () => {
			$('.TableSub').addClass('hidden');
			$('#separator').addClass('hidden');
			$('.button-table-open').addClass('hidden');
		};
		//-------------------------------------------------------
		// || ======== *** Dark Mod *** ========= ||
		//-------------------------------------------------------
		if (localStorage.getItem('color-mode') === 'dark' || (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('color-mode'))) {
			document.documentElement.setAttribute('color-mode', 'dark');
		}
		if (window.CSS && CSS.supports('color', 'var(--primary)')) {
			var toggleColorMode = function toggleColorMode(e) {
				// Switch to Light Mode
				if (e.currentTarget.classList.contains('light--hidden')) {
					// Sets the custom html attribute
					document.documentElement.setAttribute('color-mode', 'light'); // Sets the user's preference in local storage

					localStorage.setItem('color-mode', 'light');
					return;
				}
				/* Switch to Dark Mode Sets the custom html attribute */
				document.documentElement.setAttribute('color-mode', 'dark'); // Sets the user's preference in local storage

				localStorage.setItem('color-mode', 'dark');
			}; // Get the buttons in the DOM

			var toggleColorButtons = document.querySelectorAll('.color-mode__btn'); // Set up event listeners

			toggleColorButtons.forEach(function (btn) {
				btn.addEventListener('click', toggleColorMode);
			});
		} else {
			// If the feature isn't supported, then we hide the toggle buttons
			var btnContainer = document.querySelector('.color-mode__header');
			btnContainer.style.display = 'none';
		}
		//-------------------------------------------------------
		// || ======== *** dragging and moving *** ========= ||
		//-------------------------------------------------------
		// A function is used for dragging and moving
		const dragElement = (element, direction) => {
			var md; // remember mouse down info
			const first = document.getElementById('Table');
			const second = document.getElementById('TableSubConter');
			element.onmousedown = onMouseDown;
			var onMouseDown = (e) => {
				log(e);
				md = {
					e,
					offsetLeft: element.offsetLeft,
					offsetTop: element.offsetTop,
					firstWidth: first.offsetWidth,
					secondWidth: second.offsetWidth,
				};

				document.onmousemove = onMouseMove;
				document.onmouseup = () => {
					document.onmousemove = document.onmouseup = null;
				};
			};

			var onMouseMove = (e) => {
				var delta = {
					x: e.clientX - md.e.clientX,
					y: e.clientY - md.e.clientY,
				};

				if (direction === 'H') {
					// Horizontal
					// Prevent negative-sized elements
					delta.x = Math.min(Math.max(delta.x, -md.firstWidth), md.secondWidth);

					element.style.left = md.offsetLeft + delta.x + 'px';
					document.getElementById('button-table-open').style.left = -20 + md.offsetLeft + delta.x + 'px';
					first.style.width = md.firstWidth + delta.x + 'px';
					second.style.width = md.secondWidth - delta.x + 'px';
				}
			};
		};

		dragElement(document.getElementById('separator'), 'H');
	}
}
