(function( $ ) {
	
	var publicMethods = {
		destroy: function() {
			$(this).empty().data("ui-treeview-options", null);
		}
	};
	
	var eventHandlers = {
		onNodeClick: function(e, ui) {
			var childNodes = $(this).parent().find('> ul');
			var options = privateMethods.fetchOptions(this);
			if ( $.isFunction(options.onNodeClick) ) {
				options.onNodeClick.call(this, $(this).data('ui-treeview-nodemodel'), e)
			}
			if (childNodes.length > 0) {
				if (childNodes.is(":visible") ) {
					childNodes.hide();
				} else {
					childNodes.show();
				}
			}
		}
	};
	
	var privateMethods = {
		attachEventHandlers: function(nodeModel, DOMCtx) {
			nodeModel().title.on('change', function(newVal) {
				$(DOMCtx).parent().find('> .ui-treeview-title').html(newVal);
			})
		},
		updateNodeList: function(nodeList, DOMCtx) {
			DOMCtx = $(DOMCtx).empty();
			if ( ! nodeList.uiTreeviewManaged) {
				nodeList.on(["push"
					, "elemchange"
					, "pop"
					, "reverse"
					, "shift"
					, "unshift"]
					, function(newVal) {
						privateMethods.updateNodeList(nodeList, DOMCtx);
					});
				nodeList.uiTreeviewManaged = true;
			}
			for (var i = 0; i < nodeList().length; ++i) {
				this.updateNode( nodeList(i), DOMCtx.append('<li style="list-style-type: none"></li>').find('li:last') );
			}	
		},
		updateNode: function(nodeModel, DOMCtx) {
			DOMCtx = $(DOMCtx).empty();
			var title = ($.isFunction(nodeModel().title) && nodeModel().title()) || '';
			DOMCtx.append('<span></span>')
				.find('> span:first')
				.text(title)
				.data('ui-treeview-nodemodel', nodeModel)
				.click(eventHandlers.onNodeClick);
			
			if ( ! nodeModel().title.uiTreeviewManaged) {
				nodeModel().title.on("change", function(newVal, oldVal) {
					DOMCtx.find("> span:first").html(newVal);
				});
				nodeModel().title.uiTreeviewManaged = true;
			}
				
			if (nodeModel().childNodes !== undefined && nodeModel().childNodes() !== null) {
				this.updateNodeList(nodeModel().childNodes, DOMCtx.append('<ul></ul>').find('> ul'));
			}
		},
		fetchOptions: function(nodeDOMElem) {
			var current = $(nodeDOMElem);
			while(current) {
				var candidate = current.data("ui-treeview-options");
				if (candidate)
					return candidate;
					
				current = current.parent();
			}
			return null;
		}
	};
	
	$.fn.treeview = function() {
		var options = {
			dataModel: null,
			dataSource: null
		};
		
		var isConstructor = false;
		
		if (arguments.length == 1 && $.isPlainObject(arguments[0]) ) {
			options = $.extend(options, arguments[0]);
			isConstructor = true;
		} else if (arguments.length == 0) {
			isConstructor = true;
		}
		
		if (isConstructor) {
			var existingOptions = $(this).data('ui-treeview-options');
			if (existingOptions)
				throw "can not create multiple treeviews in the same DOM element";
				
			$(this).data('ui-treeview-options', options);
			
			$(this).empty()
				.addClass('ui-widget')
				.addClass('ui-widget-content')
				.addClass('ui-corner-all');

			var model = options.dataModel;
			
			if (model().title !== undefined && model().title() !== null) {
				$(this).html('<div class="ui-widget-header ui-treeview-title">'
					+ model().title() + '</div>');
			}
			
			if (model().childNodes) {
				$(this).append('<ul></ul>');
				var ulTag = $(this).find('> ul');
				privateMethods.updateNodeList(model().childNodes, ulTag);
				$(this).find('> ul ul').hide();
			}
			
		} else {
			var methodName = arguments[ 0 ];
			if ( ! publicMethods[methodName] )
				throw "treeview doesn't have method '" + methodName + "'";
				
			var args = [];
			for (var i = 1; i < arguments.length; ++i) {
				args.push( arguments[ i ] );
			}
			publicMethods[methodName].apply(this, args);
		}
		
		return this;
	}
	
})(jQuery);
