var dnd = new (function () {
	_this = this;
	_this.placeholder = $('<div class="item item--placeHolder"></div>');
	this.reset = function () {
		_this.element = null;
		_this.from = null;
		_this.to = null;
		_this.index = -1;
	};
	this.start = function (element, from) {
		_this.from = from;
		_this.element = element;
	};
	this.reset();
})();

var makeOptions = function (valueAccessor, afterRender) {
	var options = ko.utils.unwrapObservable(valueAccessor()) || {};
	return options.data
		? {
				foreach: options.data,
				name: options.template,
				afterRender: afterRender,
		  }
		: {
				foreach: valueAccessor(),
				afterRender: afterRender,
		  };
};

var dist = function (x1, y1, x2, y2) {
	var x = x1 - x2,
		y = y1 - y2;
	return Math.sqrt(x * x + y * y);
};

var isBefore = function (x, y, node, orientation) {
	var h = node.clientHeight / 2;
	var w = node.clientWidth / 2;
	var nX = node.offsetLeft + h;
	var nY = node.offsetTop + w;
	if (orientation.toLowerCase() === 'vertical') {
		return y < nY;
	} else {
		return x < nX;
	}
};

var makeDropZone = function (element, data) {
	ko.utils.domData.set(element, 'list-data', data);
	var $element = $(element);
	$element
		.on('dragenter', function (event) {
			dnd.placeholder.detach();
			event.preventDefault();
			event.delegateTarget.classList.add('container--dragging');
			var container = event.delegateTarget;
			var minDist = Number.MAX_VALUE;
			var nearestNode = container.children[container.childElementCount - 1];
			var eventX = event.originalEvent.clientX;
			var eventY = event.originalEvent.clientY;
			var index = 0;
			for (var i = 0; i < container.childElementCount; i++) {
				var currentNode = container.children[i];
				currentNode.classList.remove('item--nearest');
				currentNode.classList.remove('insert-before');
				currentNode.classList.remove('insert-after');
				var h = currentNode.clientHeight / 2;
				var w = currentNode.clientWidth / 2;
				var currentDist = dist(eventX, eventY, currentNode.offsetLeft + h, currentNode.offsetTop + w);
				if (currentDist < minDist) {
					minDist = currentDist;
					nearestNode = currentNode;
					dnd.index = i;
				}
			}
			if (isBefore(eventX, eventY, nearestNode, 'horizontal')) {
				dnd.placeholder.insertBefore(nearestNode);
			} else {
				dnd.placeholder.insertAfter(nearestNode);
				dnd.index++;
			}
			console.log(nearestNode.textContent);
			return false;
		})
		.on('dragover', function (event) {
			event.preventDefault();
		})
		.on('dragleave', function (event) {
			event.target.classList.remove('container--dragging');
		})
		.on('drop', function (event) {
			event.preventDefault();
			event.target.classList.remove('container--dragging');
			dnd.to = ko.utils.domData.get(event.delegateTarget, 'list-data');
			var index = dnd.from.indexOf(dnd.element);
			if (dnd.from === dnd.to) {
				dnd.to.splice(dnd.index, 0, dnd.to.splice(index, 1)[0]);
			} else {
				dnd.to.splice(dnd.index, 0, dnd.element);
				dnd.from.splice(index, 1);
			}
			dnd.reset();
			dnd.placeholder.detach();
		});
};

var makeDraggables = function (elements, data) {
	$elements = $(elements);
	for (var i = 0; i < elements.length; i++) {
		var element = elements[i];
		if (element.nodeType === 1) {
			element.draggable = true;
			ko.utils.domData.set(element, 'item-data', data);
			$el = $(element);
			$el.on('dragstart', function (event) {
				event.target.classList.add('item--dragging');
				dnd.from = ko.utils.domData.get(event.target.parentNode, 'list-data');
				dnd.element = ko.utils.domData.get(event.target, 'item-data');
				event.originalEvent.dataTransfer.setData('text/x-tickx', 'firefox will not start dragging if this is empty...');
			})
				.on('dragend', function (event) {
					event.target.classList.remove('item--dragging');
				})
				.on('dragleave', function (event) {
					event.target.classList.remove('item--dragging');
				});
		}
	}
};

ko.bindingHandlers.dropzone = {
	init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		makeDropZone(element, valueAccessor());
		var options = makeOptions(valueAccessor, makeDraggables);
		ko.bindingHandlers.template.init(
			element,
			function () {
				return options;
			},
			allBindings,
			viewModel,
			bindingContext,
		);
		return { controlsDescendantBindings: true };
	},
	update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var options = makeOptions(valueAccessor, makeDraggables);
		ko.bindingHandlers.template.update(
			element,
			function () {
				return options;
			},
			allBindings,
			viewModel,
			bindingContext,
		);
	},
};
