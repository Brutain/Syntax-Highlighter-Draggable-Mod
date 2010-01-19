/**
 * SyntaxHighlighter
 * http://alexgorbatchev.com/
 *
 * SyntaxHighlighter is donationware. If you are using it, please donate.
 * http://alexgorbatchev.com/wiki/SyntaxHighlighter:Donate
 *
 * @version
 * 2.1.364.1 (18-Dec-2009)
 * 
 * @copyright
 * Copyright (C) 2004-2009 Alex Gorbatchev.
 * Portions Copyright (C) 2009 Dan Breslau
 *
 * @license
 * This file is part of SyntaxHighlighter.
 * 
 * SyntaxHighlighter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * SyntaxHighlighter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SyntaxHighlighter.  If not, see <http://www.gnu.org/copyleft/lesser.html>.
 */
//
// Begin anonymous function. This is used to contain local scope variables without polutting global scope.
//
if (!window.SyntaxHighlighter) {
var SyntaxHighlighter = function() { 

// Constants
	var spanClass = '<span class="',
		divClass =  '<div class="',
		codeClass =  '<code class="',
		closeSpan = '</span>',
		closeDiv = '</div>',
		closeCode = '</code>',
		aSpace = ' '
	;

	// See the anonymous initializer function, below.
	var lineTerm=null, isMSIE, isMSIE6, isMSIE7, isOpera;

	// lineTerm is needed for formatting the displayed text. (IE 6 and 7
	// need some help with newlines; copy & paste doesn't work well without this.
	// IE8 doesn't appear to have the problem.)
	(function() {

		var ua;
		if (! (navigator && (ua = navigator.userAgent))) {
			return;
		}

		if (/Opera[\/\s]\d+\.\d+/.test(ua)){
			isOpera = true;
			return;
		}

		if (! /\bMSIE /.test(ua)) {
			// Not IE
			return;
		}

		// Any IE
		isMSIE = true;
		lineTerm = '\r';

		// IE 6
		if (/\bMSIE 6\./.test(ua)) {
			isMSIE6 = true;
			lineTerm = '\r\n';
		}

		// IE 7
		else if (/\bMSIE 7\./.test(ua)) {
			isMSIE7 = true;
		}
	})();

	/**
	 * Shortcut to document.createElement().
	 * @param {String} name		Name of the element to create (DIV, A, etc).
	 * @return {HTMLElement}	Returns new HTML element.
	 */
	var createElement = function(name, className)
	{
		var e = document.createElement(name);
		if (className) {
			e.className = className;
		}
		return e;
	};

 	var setCSS = function(elem, name, value) {
		if (!(elem.style[name])) {
			var curStyle = elem.getAttribute("style");
			if (!curStyle) {
				curStyle = "";
			}
			if (typeof(curStyle) === 'object') {
				// IE needs us to get/set style attributes on the 'style' object
				elem.style.setAttribute(name, value);
				return;
			}

			else {
				curStyle = sh.utils.trim(curStyle);
				if (curStyle.charAt(curStyle.length - 1) != ';') {
					curStyle += ";" ;
				}
			}
			var newStyle = curStyle + " " + name + ": " + value + ";";
			elem.setAttribute("style", newStyle);
		}

		else {
			elem.style[name] = value;
		}
	};



	
	/**
	 * Pads number with zeros until its length is the same as given length.
	 * 
	 * @param {Number} number	Number to pad.
	 * @param {Number} length	Max string length with.
	 * @return {String}			Returns a string padded with proper amount of '0', terminated with a '.'
	 */
	var formatLineNumber = function(number, length)
	{
		var result = number.toString();
		
		while (result.length < length) {
			result = '0' + result;
		}
		
		return result;
	};


	/**
	 * Gets the text content of the element, stripped of markup.
	 * (This may not be available in all browsers; the caller must
	 * be able to handle a null return value.)
	 *
	 * @param {Element} element	The DOM element
	 * @return {String}	Returns the text, or null if not available
	 */
	var getElemText = function(elem)
	{
		var text = null;
		try {
			// textContent is defined in DOM Level 3, and implemented
			// in Firefox.  innerText is IE-specific.
			text = elem.textContent || elem.innerText;
		}
		catch (e) {}
		return text;
	};

	/**
	 * Create a standard anchor button for the toolbar.
	 *
	 * For accessibility, the caller should supply a label that includes the highlighter's
	 * title, if one has been set (e.g., "view plain text source for <highlighter name>").
	 *
	 * Likewise, if visible link text is to be created (e.g., for "expand source"), the
	 * highlighter's title should be included in the link text.
	 *
	 * @param {String} highlighter		Highlighter that this button will belong to.
	 * @param {String} label			Label text to display (usually in a tooltip) -- mandatory.
	 * @param {Boolean} linkText		Text to use in the text element (should be null for iconic links.)
	 * @return {Object}					Returns a new button, with an 'A' node in the
	 *									'element' property.
	 */
	var Button = function(highlighter, label, linkText)
	{
		var a = this.element = createElement('a'),
			theButton = this
		;
		
		a.href = "javascript: return false;" ;
		a.title = label;
		a.innerHTML = linkText || aSpace;
		a.className = (linkText ? '' : 'icon');

		a.onclick = function(e)
		{
			try
			{
				theButton.execute(e || window.event);
			}
			catch(ex)
			{
				sh.utils.alert(ex.message);
			}
			
			return false;
		};
	};
	
	var DragArea = function(highlighter, label, linkText)
	{
		var a = this.element = createElement('a'),
			theButton = this
		;
		
		a.test = "test";
		a.href = "javascript: return false;" ;
		a.title = label;
		a.innerHTML = linkText || aSpace;
		a.className = (linkText ? '' : 'icon');
		
		a.onclick = function(e){return false;};
		a.onmousedown = function(e)
		{
			try
			{
				theButton.mouseDown(e || window.event);
				
				
			}
			catch(ex)
			{
				sh.utils.alert(ex.message);
			}
			
			return false;
		};
		highlighter.div.onmousemove = function(e)
		{
			try
			{
				theButton.mouseMove(e || window.event);
			}
			catch(ex)
			{
				sh.utils.alert(ex.message);
			}
			
			return false;
		};
		highlighter.div.onmouseup = function(){
			theButton.mouseUp();
			return false;
		}
	};

	var indexOf = (Array.prototype.indexOf ? 
				   (function(array, searchElement, fromIndex) {
					   return array.indexOf(searchElement, fromIndex);
				   })
				   :
				   (function(array, searchElement, fromIndex)
					{
						fromIndex = Math.max(fromIndex || 0, 0);
						var i = array.length;
						while (--i >= 0) {
							if (array[i] === searchElement) {
								return i;
							}
						}
						return -1;
					})
				  );


		/**
		 * Finds all <SCRIPT TYPE="syntaxhighlighter" /> elements.
		 * @return {Array} Returns array of all found SyntaxHighlighter tags.
		 */
		var getSyntaxHighlighterScriptTags = function()
		{
			var tags = document.getElementsByTagName('script'),
				result = []
				;
			
			var i = tags.length;
			while (--i >= 0 ) {
				if (tags[i].type === 'syntaxhighlighter') {
					result.push(tags[i]);
				}
			}
					
			return result;
		};
		
		/**
		 * Strips <![CDATA[]]> from <SCRIPT /> content because it should be used
		 * there in most cases for XHTML compliance.
		 * @param {String} original	Input code.
		 * @return {String} Returns code without leading <![CDATA[]]> tags.
		 */
		var stripCData = function(original)
		{
			var left = '<![CDATA[',
				right = ']]>',
				// for some reason IE inserts some leading blanks here
				copy = sh.utils.trim(original),
				changed = false
				;
			
			if (copy.indexOf(left) === 0)
			{
				copy = copy.substring(left.length);
				changed = true;
			}
			
			if (copy.indexOf(right) === copy.length - right.length)
			{
				copy = copy.substring(0, copy.length - right.length);
				changed = true;
			}
			
			return changed ? copy : original;
		};



// Shortcut object which will be assigned to the SyntaxHighlighter variable.
// This is a shorthand for local reference in order to avoid long namespace 
// references to SyntaxHighlighter.whatever...
var sh = {
	defaults : {
		/** Additional CSS class names to be added to highlighter elements. */
		'class-name' : '',
		
		/** First line number. */
		'first-line' : 1,
		
		/**
		 * Pads line numbers. Possible values are:
		 *
		 *   false - don't pad line numbers.
		 *   true  - automaticaly pad numbers with minimum required number of leading zeroes.
		 *   [int] - length up to which pad line numbers.
		 */
		'pad-line-numbers' : true,

		/** Lines to highlight. */
		'highlight' : [],
		
		/** Enables or disables smart tabs. */
		'smart-tabs' : true,
		
		/** Gets or sets tab size. */
		'tab-size' : 4,
		
		/** Enables or disables ruler. */
		'ruler' : false,
		
		/** Enables or disables gutter. */
		'gutter' : true,
		
		/** Title text, displayed above highlighter and in tooltips */
		/** NOTE: This feature is new, and subject to change; use at your own risk! */
		'title' : null,

		/** Enables or disables toolbar. */
		'toolbar' : true,
		
		/** Forces code view to be collapsed. */
		'collapse' : false,
		
		/** Enables or disables automatic links. */
		'auto-links' : true,
		
		/** Gets or sets light mode. Equavalent to turning off gutter and toolbar. */
		'light' : false,
		
		/** Enables or disables automatic line wrapping. */
		'wrap-lines' : true,
		
		'html-script' : false
	},
	
	config : {
		/** Enables use of <SCRIPT type="syntaxhighlighter" /> tags. */
		useScriptTags : true,

		/** Blogger mode flag. */
		bloggerMode : false,
		
		stripBrs : false,
		
		/** Name of the tag that SyntaxHighlighter will automatically look for. */
		tagName : 'pre',
		
		strings : {
			drag: 'drag source code',
			expandSource : 'show source',
			collapseSource : 'hide',
			viewSource : 'view plain text source',
			toggleLineNumbers : 'toggle line numbers',
			print : 'print',
			help : 'About SyntaxHighlighter',
			alert: 'SyntaxHighlighter\n\n',
			noBrush : 'Can\'t find brush for: ',
			brushNotHtmlScript : 'Brush wasn\'t configured for html-script option: ',
			highlighter : "Highlighter" ,
			hlFor : " for ",

			// this is populated by the build script
			aboutDialog : '@ABOUT@'
		},

		/** If true, output will show the generated HTML. */
		debug : false
	},
	
	/** Internal 'global' variables. */
	vars : {
		aliasMap : {},
		printFrame : null,
		highlighters : {}
	},
	
	/** This object is populated by user included external brush files. */
	brushes : {},

	/** Common regular expressions. */
	regexLib : {
		multiLineCComments			: /\/\*[\s\S]*?\*\//gm,
		singleLineCComments			: /\/\/.*$/gm,
		singleLinePerlComments		: /#.*$/gm,
		doubleQuotedString			: /"([^\\"\n]|\\.)*"/g,
		singleQuotedString			: /'([^\\'\n]|\\.)*'/g,
		multiLineDoubleQuotedString	: /"([^\\"]|\\.)*"/g,
		multiLineSingleQuotedString	: /'([^\\']|\\.)*'/g,
		xmlComments					: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,

		url							: /\w+:\/\/[\w-.\/?%&=]*/g,
//Newer verion		url							: /&lt;\w+:\/\/[\w-.\/?%&=@:;]*&gt;|\w+:\/\/[\w-.\/?%&=@:;]*/g,
		
		/** <?= ?> tags. */
		phpScriptTags				: { left: /(&lt;|<)\?=?/g, right: /\?(&gt;|>)/g },
		
		/** <%= %> tags. */
		aspScriptTags				: { left: /(&lt;|<)%=?/g, right: /%(&gt;|>)/g },
		
		/** <script></script> tags. */
		scriptScriptTags			: { left: /(&lt;|<)\s*script.*?(&gt;|>)/gi, right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi },

		// Note that tabs are deliberately omitted from this regexp.
		// For Opera (and only Opera?), we need to include the hex encoding for the non-breaking
		// space character, or the regexp won't match in places where it otherwise should.
		leadingSpaces : /^((&nbsp;)|\u00A0| )+/,
		allSpaces : /^((&nbsp;)|\u00A0| )*$/
	},

	toolbar : {
		
		/**
		 * Creates new toolbar for a highlighter.
		 * @param {Highlighter} highlighter    Target highlighter.
		 */
		create : function(highlighter)
		{
			var div = createElement('div', 'toolbar'),
				items = sh.toolbar.items
				;
			
			for (var name in items) 
			{
				
				var command = new items[name](highlighter),
					element = command.element
					;
				
				if (element) {
					element.className += ' item ' + name;
					div.appendChild(element);
				}
			}
			return div;
		},
		
		/** Collection of toolbar items. */
		items : {
			drag : function(highlighter) //Drag
			{	
				var strings = sh.config.strings,
					label = strings.drag,
					title = highlighter.getTitle();

				if (title) {
					label = label + strings.hlFor + title;
				}
				
				var dragArea = new DragArea(highlighter, label, "Drag");
				
				dragArea.mouseDown = function startDrag(e){
					if(!e){var e=window.event};
					// determine target element
					targ = highlighter.div;
					// calculate event X,Y coordinates
					this.offsetX=e.clientX;
					this.offsetY=e.clientY;
					// assign default values for top and left properties
					if(!targ.style.left){targ.style.left='0px'};
					if(!targ.style.top){targ.style.top='0px'};
					// calculate integer values for top and left properties
					this.coordX=parseInt(targ.style.left);
					this.coordY=parseInt(targ.style.top);
					this.drag=true;
					highlighter.div.style.zIndex = "999";
					return false;
				};
				
				// continue dragging
				dragArea.mouseMove = function dragDiv(e){
					if(!this.drag){return};
					if(!e){var e=window.event};
					//var targ=e.target?e.target:e.srcElement;
					targ=highlighter.div;		
								
					// move div element
					targ.style.left=this.coordX+e.clientX-this.offsetX+'px';
					targ.style.top=this.coordY+e.clientY-this.offsetY+'px';
					return false;
				};
				
				dragArea.mouseUp = function(){
					this.drag=false;
				}

				return dragArea;								
			},
			expandSource : function(highlighter)
			{
				var strings = sh.config.strings,
					label = strings.expandSource,
					title = highlighter.getTitle();

				if (title) {
					label = label + strings.hlFor + title;
				}

				var button = new Button(highlighter, label, label);
				
				button.execute = function(event)
				{
					var div = highlighter.div;
					
					div.className = div.className.replace(/ ?collapsed/, '');
					highlighter.layoutChanged = true;
					highlighter.startBackgroundFix();
				};

				return button;
			},
		
			collapseSource : function(highlighter)
			{
				var strings = sh.config.strings,
					label = strings.collapseSource,
					title = highlighter.getTitle();

				if (title) {
					label = label + ' ' + title;
				}

				var button = new Button(highlighter, label);
				
				button.execute = function(event)
				{
					var div = highlighter.div;
					var linesDiv = sh.find('div.lines', div)[0];

					div.className += ' collapsed';
					setCSS(linesDiv, "width", "auto");
				};

				return button;
			},


			/** 
			 * Command to open a new window and display the original unformatted source code inside.
			 */
			viewSource : function(highlighter)
			{
				var strings = sh.config.strings,
					label = strings.viewSource,
					title = highlighter.getTitle();

				if (title) {
					label = label + strings.hlFor + title;
				}

				var button = new Button(highlighter, label);
				
				button.execute = function(event)
				{
					var code = sh.utils.fixBrs(highlighter.originalCode).replace(/</g, '&lt;'),
						wnd = sh.utils.popup('', '_blank', 750, 400, 'location=0, resizable=1, menubar=0, scrollbars=1')
						;
					
					code = sh.utils.unindent(code);
					
					wnd.document.write('<pre>' + code + '</pre>');
					wnd.document.close();
				};

				return button;
			},
			
			/** 
			 * Turn line number display on or off
			 */
			toggleLineNumbers : function(highlighter)
			{
				var strings = sh.config.strings,
					label = strings.toggleLineNumbers,
					title = highlighter.getTitle();

				if (title) {
					label = label + strings.hlFor + title;
				}

				var button = new Button(highlighter, label);

				button.execute = function(event)
				{
					highlighter.toggleLineNumbers();
				};

				return button;
			},
			
			/** Command to print the colored source code. */
			printSource : function(highlighter)
			{
				var label = sh.config.strings.print,
					title = highlighter.getTitle();

				if (title) {
					label = label + aSpace + title;
				}

				var button = new Button(highlighter, label);

				button.execute = function(event)
				{
					var copyStyles = function(destDoc, sourceDoc)
					{
						var links = sourceDoc.getElementsByTagName('link');
					
						for (var i = 0; i < links.length; i++) {
							if (links[i].rel.toLowerCase() === 'stylesheet' && /shCore\.css$/.test(links[i].href)) {
								destDoc.write('<link type="text/css" rel="stylesheet" href="' + links[i].href + '"></link>');
							}
						}
					};

					var iframe = createElement('iframe'),
						doc;
					
					// make sure there is never more than one hidden iframe created by SH
					if (sh.vars.printFrame) {
						document.body.removeChild(sh.vars.printFrame);
					}
					sh.vars.printFrame = iframe;
					
					// this hides the iframe
					iframe.style.cssText = 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;';
				
					document.body.appendChild(iframe);
					doc = iframe.contentWindow.document;
					
					copyStyles(doc, window.document);
					doc.write(divClass + highlighter.div.className.replace('collapsed', '') + '">' + highlighter.div.innerHTML + closeDiv);
					doc.close();
					
					iframe.contentWindow.focus();
					iframe.contentWindow.print();
				};

				return button;
			},

			/** Command to display the about dialog window. */
			about : function(highlighter)
			{
				var strings = sh.config.strings,
					button = new Button(highlighter, strings.help);

				button.execute = function(event)
				{	
					var wnd = sh.utils.popup('', '_blank', 500, 250, 'scrollbars=0'),
						doc = wnd.document
						;
					
					doc.write(strings.aboutDialog);
					doc.close();
					wnd.focus();
				};

				return button;
			}
		}
	},

	/**
	 * Returns true if the given element has a 'class' attribute
	 * (in CSS format) that names the given class.
	 * @param elem		Reference to an Element node in the DOM.
	 * @param className	Name of class to match on.
	 */
	hasClass: (function() {
		// Create a closure to contain a static cache for compiled
		// regexps. (This improves overall performance by about 40%,
		// at least in IE.)
		var cache = {}, reg;
		return (function(elem, className) {
			if (!(reg = cache[className])) {
				reg = cache[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
			}
			return reg.test(elem.className);
		});
	})(),


	/** 
	 * Partial substitute for jQuery's find() method. Currently
	 * works only with tag and class names; supports descendant
	 * selectors ("div.class1 span.class2").
	 * 
	 * @param {String} selectorString	CSS-style selector, using only class
	 * and tag names. (Using *both* the tag and class names is faster than
	 * using only a class name.)
	 * @param {Object} elem				DOMElement; null searches entire DOM.
	 */
		find: function(selectorString, elem)
		{
			var matchesClassNames = function(elem, classNames)
			{
				if (!classNames) {
					return true;
				}
				for (var i = 0; i < classNames.length; i++) {
					if (!sh.hasClass(elem, classNames[i])) {
						return false;
					}
				}
				return true;
			};

			var findByTagAndClass = function(parents, tagName, selectorTerms)
			{
				var results = [];
				for (var i = 0; i < parents.length; i++) {
					var nodeList = parents[i].getElementsByTagName(tagName), len = nodeList.length;
					for (var j = 0; j < len; j++) {
						var node = nodeList[j];
						if (matchesClassNames(node, selectorTerms)) {
							results.push(node);
						}
					}
				}
				return results;
			};

			var selectors = null,
			selectorTerms = [],
			parents = [],
			results = [];

			if (!selectorString || !(selectorString = sh.utils.trim(selectorString))) {
				return null;
			}

			parents[0] = elem || document.body;

			selectors = selectorString.split(aSpace);
			for (var i = 0; i < selectors.length; i++) {
				selectorTerms = selectors[i].split('.');
				if (selectorTerms[0].length > 0) {
					// A tag name was specified
					var tagName = selectorTerms[0];
					selectorTerms.splice(0, 1);
					results = (findByTagAndClass(parents, tagName, selectorTerms));
				}
				else {
					// N.B: The last changeset where findByClassNames *was* available:
					// 67:62c4a2bec07f, Sun Jul 12 14:38:07 2009 -0400.
					// It was removed because searches that do use the tag name
					// are *much* faster.

					// selectorTerms.splice(0, 1);
					// results = findByClassNames(parents, selectorTerms);
					throw Error("findByClassNames is not available!");
				}

				parents = results;
			}
			return results;
		},


		/**
		 * Partial substitute for jQuery's foreach() method. Currently
		 * works only with tag and class names.
		 * @param {String} selector	CSS-style selector, using only class
		 * 		and tag names.  (Using *both* the tag and class names is faster
		 * 		than using only a class name.)
		 * @param {Object} node		DOMElement; null searches entire DOM.
		 * @param {Function} callback  Function to invoke for each found element.
		 */
		forEach: function(selector, node, callback)
		{
			var results = sh.find(selector, node);
			for (var i = 0; i < results.length; i++) {
				callback(results[i]);
			}
		},

		utils : {
		/**
		 * Generates a unique element ID.
		 */
		guid : function(prefix)
		{
			return prefix + Math.round(Math.random() * 1000000).toString();
		},

		/**
		 * Merges two objects. Values from obj2 override values in obj1.
		 * Function is NOT recursive and works only for one dimensional objects.
		 * @param {Object} obj1 First object.
		 * @param {Object} obj2 Second object.
		 * @return {Object} Returns combination of both objects.
		 */
		merge: function(obj1, obj2)
		{
			var result = {}, name;

			for (name in obj1) {
				result[name] = obj1[name];
			}
			
			for (name in obj2) {
				result[name] = obj2[name];
			}
				
			return result;
		},
		
		/**
		 * Opens up a centered popup window.
		 * @param {String} url		URL to open in the window.
		 * @param {String} name		Popup name.
		 * @param {int} width		Popup width.
		 * @param {int} height		Popup height.
		 * @param {String} options	window.open() options.
		 * @return {Window}			Returns window instance.
		 */
		popup: function(url, name, width, height, options)
		{
			var x = (screen.width - width) / 2,
				y = (screen.height - height) / 2
				;
				
			options +=	', left=' + x + 
						', top=' + y +
						', width=' + width +
						', height=' + height
				;
			options = options.replace(/^,/, '');

			var win = window.open(url, name, options);
			win.focus();
			return win;
		},
		
		/**
		 * Adds event handler to the target object.
		 * @param {Object} obj		Target object.
		 * @param {String} type		Name of the event.
		 * @param {Function} func	Handling function.
		 */
		addEvent: function(obj, type, func)
		{
			if (obj.attachEvent) 
			{
				obj['e' + type + func] = func;
				obj[type + func] = function()
				{
					obj['e' + type + func](window.event);
				};
				obj.attachEvent('on' + type, obj[type + func]);
			}
			else 
			{
				obj.addEventListener(type, func, false);
			}
		},

		/**
		 * Displays an alert.
		 * @param {String} str String to display.
		 */
		alert: function(str)
		{
			alert(sh.config.strings.alert + str);
		},
		
		/**
		 * Creates a highlighter, given a name or alias for the brush.
		 *
		 * @param {String} alias	Brush alias.
		 * @param {Boolean} alert	If 'truthy', show an alert if the brush is not found.
		 * @return {Brush}			Returns brush constructor if found, null otherwise.
		 */
		makeHighlighter: function(alias, alert)
		{
			// The 'brush' methods are written to instantiate data that's static
			// in nature (particularly RegExps), which could be shared between
			// highlighters of the same class.  Here, we create new, empty
			// functions to serve as the "constructors" for each highlighter
			// class, and assign an instantiated 'brush' as the prototype of
			// the constructor.  This shares the brush data among all highlighters
			// constructed through that function.

			var br = sh.brushes, ctor,
				brushClass = br[alias] || br[sh.vars.aliasMap[alias]];

			if (!brushClass) {
				// The brush method isn't registered -- at least, not yet.
				if (alert) {
					sh.utils.alert(sh.config.strings.noBrush + alias);
				}
				return null;
			}

			if (!(ctor = brushClass.ctor)) {
				// The brush method has been registered, but no instances of 
				// the brush have been created yet.  Create a new, empty
				// function to serve as the highlighter constructor, and
				// use a new brush instance as the highlighter's prototype.
				ctor = brushClass.ctor = (function() {});
				ctor.prototype = new brushClass();
			}

			return new ctor();
		},
		
		/**
		 * Executes a callback on each line and replaces each line with result from the callback.
		 * @param {Object} str			Input string.
		 * @param {Object} callback		Callback function taking one string argument and returning a string.
		 */
		eachLine: function(str, callback)
		{
			var lines = str.split('\n');
			
			for (var i = 0; i < lines.length; i++) {
				lines[i] = callback(lines[i]);
			}
				
			return lines.join('\n');
		},
		
		/**
		 * Creates rules looking div.
		 */
		createRuler: function(hasGutter, rulerMax)
		{
			var line = createElement('div', 'line alt2 rulerLine'),
				ruler = createElement('span', 'ruler'),
				showEvery = 10,
				i = 1,
				str=''
				;
			
			// Use 100 as a minimum length for the ruler
			rulerMax = (rulerMax < 100 ? 100 : rulerMax);
			while (i <= rulerMax) 
			{
				if (i % showEvery === 0) 
				{
					str += i;
					i += (i + '').length;
				}
				else 
				{
					str += '&middot;';
					i++;
				}
			}

			ruler.innerHTML = str;
			if (hasGutter) {
				// Create an empty <code> element
				line.innerHTML = codeClass + 'number"/>';
			}
			line.appendChild(ruler);
	
			return line;
		},
	
		/**
		 * This is a special trim which only removes first and last empty lines
		 * and doesn't affect valid leading space on the first line.
		 * 
		 * @param {String} str   Input string
		 * @return {String}      Returns string without empty first and last lines.
		 */
		trimFirstAndLastLines: function(str)
		{
			return str.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, '');
		},
		
		/**
		 * Parses key/value pairs into hash object.
		 * 
		 * Understands the following formats:
		 * - name: word;
		 * - name: [word, word];
		 * - name: "string";
		 * - name: 'string';
		 * 
		 * For example:
		 *   name1: value; name2: [value, value]; name3: 'value'
		 *   
		 * @param {String} str    Input string.
		 * @return {Object}       Returns deserialized object.
		 */
		parseParams: function(str)
		{
			var match, 
				result = {},
				arrayRegex = new XRegExp("^\\[(?<values>(.*?))\\]$"),
				regex = new XRegExp(
					"(?<name>[\\w-]+)" +
					"\\s*:\\s*" +
					"(?<value>" +
						"[\\w-%#]+|" +		// word
						"\\[.*?\\]|" +		// [] array
						'".*?"|' +			// "" string
						"'.*?'" +			// '' string
					")\\s*;?",
					"g"
				)
				;

			while ((match = regex.exec(str)))
			{
				var value = match.value
					.replace(/^['"]|['"]$/g, '') // strip quotes from end of strings
					;
				
				// try to parse array value
				if (value && arrayRegex.test(value))
				{
					var m = arrayRegex.exec(value);
					value = m.values.length > 0 ? m.values.split(/\s*,\s*/) : [];
				}
				
				result[match.name] = value;
			}
			
			return result;
		},
	
		/**
		 * Wraps each line of the string into <code/> tag with given style applied to it.
		 * 
		 * @param {String} str   Input string.
		 * @param {String} css   Style name to apply to the string.
		 * @return {String}      Returns input string with each line surrounded by <span/> tag.
		 */
		decorate: function(str, css)
		{
			if (!str || str === '\n') {
				return str;
			}
	
			str = str.replace(/</g, '&lt;');
	
			// Split each line and apply <code class="...">...</code> to them so that
			// leading spaces aren't included.
			if (css) {
				str = sh.utils.eachLine(str, function(line)
				{
					if (!line) {
						return '';
					}
					
					var spaces = '';
					
					line = line.replace(sh.regexLib.leadingSpaces, function(s)
					{
						spaces = s;
						return '';
					});
					
					if (!line) {
						return spaces;
					}
					
					return spaces + codeClass + css + '">' + line + closeCode;
				});
			}

			return str;
		},
		
		/**
		 * Measures width of a single space character.
		 * @return {Number} Returns width of a single space character.
		 */
		measureSpace : function(target, makeLineDiv)
		{
			// The DOM subtree is cached, and used for each call.
			var container = this.measureSpaceContainer,
			span,
			parentNode = target.parentNode,
			result = 7,		// default width, used in case of error
			id,
			tmpLine
			;
			
			if (!container) {
				// Duplicate the highlighter nested structure in order to get an accurate space measurement
				container = this.measureSpaceContainer = createElement('div', 'syntaxhighlighter');

				id = sh.utils.guid('measureSpace');
				tmpLine = makeLineDiv("<span id='" + id + "'>&nbsp;" + closeSpan);

				container.innerHTML = divClass + 'lines">' + tmpLine + closeDiv;
			}

			try {
				parentNode.insertBefore(container, target);
				
				if (!(span = this.measureSpaceSpan)) {
					span = this.measureSpaceSpan = document.getElementById(id);
				}
				
				if (isOpera)
				{
					var style = window.getComputedStyle(span, null);
					result = parseInt(style.getPropertyValue("width"));
				}
				else
				{
					result = parseInt(span.offsetWidth);
				}
			}
			catch(e) {
			}

			// Remove the container from the DOM, but save it (and the span) for future use.
			parentNode.removeChild(container);
			return result;
		},

		/**
		 * Performs various string fixes based on configuration.
		 */
		fixBrs : function(str)
		{
			var br = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
			
			if (sh.config.bloggerMode) {
				str = str.replace(br, '\n');
			}
			else if (sh.config.stripBrs) {
				str = str.replace(br, '');
			}
			return str;
		},
		
		/**
		 * Removes all white space at the begining and end of a string.
		 * 
		 * @param {String} str   String to trim.
		 * @return {String}      Returns string without leading and following white space characters.
		 */
 		trim: function(str) {
			// This is trim12 from http://blog.stevenlevithan.com/archives/faster-trim-javascript
			var	newStr = str.replace(/^\s\s*/, ''),
				ws = /\s/,
				i = newStr.length;

			while (ws.test(newStr.charAt(--i))) {}

			return newStr.slice(0, i + 1);
 		},


		/**
		 * Given an array of strings, returns the maximum level of indentation
		 * common to all strings.
		 * @param {lines} Array   Text to unindent.
		 * @return {Number}       Returns minimum indentation of the lines.
		 */
		minIndent: function(lines)
		{
			if (!lines || lines.length === 0) {
				return 0;
			}

			var min = -1, len, match
			;

			// Go through every line and check for common number of indents
			for (var i = 0; i < lines.length; i++) 
			{
				var line = lines[i];

				// Skip empty lines
				if (!line) {
					continue;
				}
				
				var matches = sh.regexLib.leadingSpaces.exec(line);
				
				// If any line has no leading white space,
				// just return 0.
				if (!matches) {
					return 0;
				}

				match = matches[0];

				// Skip over lines that are all whitespace
				if (match === line) {
					continue;
				}
				match = match.replace(/(&nbsp;)|\u00A0/g, aSpace);

				len = match.length;
				min = (min < 0 ? len : Math.min(len, min));
			}

			return min;
		},

		/**
		 * Untabifies and unindents the code.
		 * @param {String}	str   		Text to clean up.
		 * @param {Number}	tabSize		Width for tab stops
		 * @param {Boolean}	smartTabs	Whether smart tabs are in use.
		 * @return {String}      Returns cleaned text block.
		 */

		fixWhitespace: function(code, tabSize, smartTabs)
		{
			var fixTabs = function(line)
			{
				var match, width, pos=0,numTabs,
				newLine='',
				tabRegExp = /\t+/g
				;

				if (!line) {
					return '';
				}

				while ((match = tabRegExp.exec(line))) {
					if (match.index > 0) {
						newLine += line.substr(pos, match.index - pos);
					}

					numTabs = match[0].length;
					width = (smartTabs ? tabSize - (newLine.length % tabSize) + (numTabs - 1)*tabSize 
							 : tabSize);
					while (--width >= 0) {
						newLine += aSpace;
					}
					pos = match.index + match[0].length;
				}

				if (newLine.length > 0) {
					line = line.substr(pos);
					if (line) {
						newLine += line;
					}
				}
				else {
					// No tabs were found.
					newLine = line;
				}
				return newLine;
			};

			var lines = code.split('\n'),
				len = lines.length
			;
			for (var i = 0; i < len; i++)
			{
				lines[i] = fixTabs(lines[i]);
			}

			return this.unindent(lines);
		},

		/**
		 * Unindents a block of text by the greatest common amount of indentation.
		 * @param {String} str   Text to unindent.
		 * @return {String}      Returns unindented text block.
		 */
		unindent: function(code)
		{
			var lines = (typeof(code) === "string" ? code.split('\n') : code),
				min = this.minIndent(lines),
				regexp
				;
			
			// Trim the maximum common white space from the beginning of every line
			if (min > 0) {
				this.regexpCache = this.regexpCache || {};
				if (! (regexp = this.regexpCache[min])) {
					regexp = this.regexpCache[min] = new RegExp("^((&nbsp;)|\u00A0| ){" + min + "}");
				}
				for (var i = 0; i < lines.length; i++) {
					lines[i] = lines[i].replace(regexp, '');
				}
			}
			return lines.join('\n');
		},

		/**
		 * Executes given regular expression on provided code and returns all
		 * matches that are found.
		 * 
		 * @param {String} code    Code to execute regular expression on.
		 * @param {Object} regex   Regular expression item info from <code>regexList</code> collection.
		 * @return {Array}         Returns a list of Match objects.
		 */ 
		getMatches: function(code, regexInfo)
		{
			var defaultAdd = function(match, regexInfo)
			{
				return [new sh.Match(match[0], match.index, regexInfo.css)];
			};
			
			var match = null,
				result = [],
				func = regexInfo.func || defaultAdd
				;
			
			while ((match = regexInfo.regex.exec(code))) {
				result = result.concat(func(match, regexInfo));
			}
				
			return result;
		},
		
		processUrls: function(code)
		{
			return code.replace(sh.regexLib.url, function(m, offset, orig)
			{
				var suffix = '</a>';

				if (offset + m.length < orig.length) {
					// The URL may originally have terminated with a < at the next position
					// in the string. If the < is replaced with '&lt;' , then the leading
					// '&lt' may be mistakenly included in the match, with the trailing
					//  ';' being the first char of the remainder of the original string.
					if (orig.charAt(offset + m.length) === ';' && /&lt$/.test(m)) {
						m = m.slice(0, -3);
						suffix += '&lt';
					}
				}

				return '<a href="' + m + '">' + m + suffix;
			});
		}
	}, // end of utils


	/**
	 * New method for brushes to register themselves with the SyntaxHighlighter.
	 * If SyntaxHighlighter.highlight() has been called, then another highlighting
	 * pass will be made, looking for regions that need to be highlighted
	 * using this brush. (This eliminates an ordering dependency between the time the
	 * brush scripts are loaded and the time that SyntaxHighlighter.highlight()
	 * is called, making it easier for the top level to load brush scripts on demand.)
	 * 
	 * @param {String} brushName     Name of the brush
	 * @param {Array}  brushAliases  List of aliases (strings)
	 * @param {Array}  brushMethod   Constructor method for the brush
	 */

	registerBrush: function(brushName, brushAliases, brushMethod)
	{
		brushMethod.prototype = new SyntaxHighlighter.Highlighter();

		var v = this.vars, i=0;

		for (; i < brushAliases.length; i++) {
			v.aliasMap[brushAliases[i]] = brushName;
		}

		this.brushes[brushName] = brushMethod;

		this.doHighlights();
	},


	/**
	 * Shorthand to highlight all elements on the page that are marked as 
	 * SyntaxHighlighter source code.
	 * 
	 * @param {Object} jsParams		Optional parameters which override element's 
	 * 								parameters. Only used if element is specified.
	 * 								(NOTE: see the comment below in doHighlight)
	 * 
	 * @param {Object} element	Optional element to highlight. If none is
	 * 							provided, all elements in the current document 
	 * 							are highlighted.
	 */ 
	highlight : function(jsParams, element)
	{
		if (element) {
			this.elementQueue = this.elementQueue || [];
			this.elementQueue.push({element: element, params: jsParams});
		}
		else {
			this.vars.ready = true;
		}
		this.doHighlights();
	},

	doHighlights : function()
	{
		var highlightElem = function(target, params) 
		{
			var highlighter, result,
				brushName = params.brush
			;

			if (!brushName) {
				return null;
			}

			// Instantiate a brush
			highlighter = sh.utils.makeHighlighter(brushName);
			if (!highlighter) {
				return null;
			}

			if (params['html-script'] === 'true' || sh.defaults['html-script'] === true)
			{
				if (!sh.brushes.Xml) {
					// need XML brush to be initialized
					return null;
				}
				// Embed the highlighter within a HtmlScript highlighter
				highlighter = new sh.HtmlScript(highlighter, brushName);
			}

			result = highlighter.highlight(target, params);
			
			if (sh.config.debug) 
			{
				var debug = createElement('textarea');
				debug.setAttribute("readOnly", "true");
				debug.value = result.innerHTML;
				setCSS(debug, 'width', '70em');
				setCSS(debug, 'height', '30em');
				result.appendChild(debug);
			}
			
			target.parentNode.replaceChild(result, target);
			return result;
		};

		var htmlParams, params, i, queue, item, target;

		// If there are any elements in the queue, process those first.
		if ((queue = this.elementQueue)) {
			for (i = 0; i < queue.length; i++) {
				
				if (!(item = queue[i])) {
					continue;
				}

				target = item.element;
				htmlParams = sh.utils.parseParams(target.className);

				//  htmlParams take precedence over JavaScript params
				// (NOTE: this contradicts the comment above highlight())
				params = sh.utils.merge(item.params, htmlParams);

				if (highlightElem(target, params)) {
					queue[i] = null;
				}
			}
		}

		if (!this.vars.ready) {
			// We can't do the rest until the top level calls this.highlight()
			// (with no params), indicating that the configuration is ready.
			return;
		}

		sh.forEach(sh.config.tagName, null, function(that) {
			params = sh.utils.parseParams(that.className);
			if (params) {
				highlightElem(that, params);
			}
		});

		var scriptElems = getSyntaxHighlighterScriptTags();
		i = scriptElems.length;
		while (--i >= 0) {
			var that = scriptElems[i];
			params = sh.utils.parseParams(that.className);
			highlightElem(that, params);
		}
	},

	// Adjust the width of lines within the highlighter boxes.
	// (See highlighter.fixLineBackgrounds() )
	fixAllLineBackgrounds : function() {
		var fixAllBackgrounds = function() {
			sh.forEach('div.syntaxhighlighter', null, function(that){
				var id = that.id;
				if (typeof(id) === 'string' && id.length > 0) {
					var highlighter = sh.vars.highlighters[id];
					highlighter.fixLineBackgrounds();
				}
			});
		};

		if (isMSIE) {
			// IE needs to re-layout before calling fixAllBackgrounds()
			window.setTimeout(fixAllBackgrounds, 1);
		}
		else {
			fixAllBackgrounds();
		}

	},

	
	/**
	 * Main entry point for the SyntaxHighlighter.
	 * @param {Object} params Optional params to apply to all highlighted elements.
	 */
	all : function(params)
	{
		sh.utils.addEvent(
			window,
			'resize',
		  	function(){sh.fixAllLineBackgrounds();}
		);


		sh.utils.addEvent(
			window,
			'load',
			function() { sh.highlight(params);}
		);
	}	
}; // end of sh

/** Match object */
sh.Match = function(value, index, css)
{
	this.value = value;
	this.index = index;
	this.length = value.length;
	this.css = css;
};

sh.Match.prototype.toString = function()
{
	return this.value;
};

/**
 * Simulates HTML code with a scripting language embedded.
 * 
 * @param {String} scriptBrushName Brush name of the scripting language.
 */
sh.HtmlScript = function(scriptHighlighter, scriptBrushName)
{
	function process(match, info)
	{
		var code = match.code,
			matches = [],
			regexList = scriptHighlighter.regexList,
			offset = match.index + match.left.length,
			htmlScript = scriptHighlighter.htmlScript,
			result
			;

		// add all matches from the code
		for (var i = 0; i < regexList.length; i++)
		{
			result = sh.utils.getMatches(code, regexList[i]);
			offsetMatches(result, offset);
			matches = matches.concat(result);
		}
		
		// add left script bracket
		if (htmlScript.left && match.left)
		{
			result = sh.utils.getMatches(match.left, htmlScript.left);
			offsetMatches(result, match.index);
			matches = matches.concat(result);
		}
		// add right script bracket
		if (htmlScript.right && match.right)
		{
			result = sh.utils.getMatches(match.right, htmlScript.right);
			offsetMatches(result, match.index + match[0].lastIndexOf(match.right));
			matches = matches.concat(result);
		}
		
		for (var j = matches.length; --j >= 0; ) {
			matches[j].highlighter = scriptHighlighter;
		}

		return matches;
	}

	var xmlBrush = new sh.brushes.Xml();
	this.xmlBrush = xmlBrush;
	
	if (!scriptHighlighter.htmlScript)
	{
		sh.utils.alert(sh.config.strings.brushNotHtmlScript + scriptBrushName);
		return;
	}
	
	xmlBrush.regexList.push(
		{ regex: scriptHighlighter.htmlScript.code, func: process }
	);
	
	var offsetMatches = function(matches, offset)
	{
		for (var j = 0; j < matches.length; j++) {
			matches[j].index += offset;
		}
	};

};

sh.HtmlScript.prototype.highlight = function(target, params)
{
	this.xmlBrush.highlight(target, params);
	
	return (this.div = this.xmlBrush.div);
};

/**
 * Main Highlighter class.
 * @constructor
 */
sh.Highlighter = function()
{
};

sh.Highlighter.prototype = {
	/**
	 * Returns value of the parameter passed to the highlighter.
	 * @param {String} name				Name of the parameter.
	 * @return {Object}					Returns found value, or undefined.
	 */
	getParam : function(name)
	{
		var result = this.params[name];

		switch (result) {
			case "true":
				return true;

			case "false":
				return false;
			}

		return result;
	},
	
	/**
	 * Applies all regular expression to the code; returns all found matches.
	 * 
	 * @param {Array} regexList		List of regular expressions.
	 * @param {String} code			Source code.
	 * @return {Array}				Returns list of matches.
	 */
	findMatches: function(regexList, code)
	{
		/**
		 * Callback method for Array.sort() which sorts matches by
		 * index position and then by length.
		 * 
		 * @param {Match} m1	Left object.
		 * @param {Match} m2    Right object.
		 * @return {Number}     Returns comparison result.
		 */
		var sortCallback = function(m1, m2)
		{
			// Sort matches by index first
			var d = m1.index - m2.index;
			if (d) {
				return d;
			}

			// If indexes are the same, sort by length
			return m1.length - m2.length;
		};

		var result = [];
		
		if (regexList) {
			for (var i = 0; i < regexList.length; i++) {
                // BUG: length returns len+1 for array if methods added to prototype chain (oising@gmail.com)
				// See http://bitbucket.org/alexg/syntaxhighlighter/issue/35/
                if (typeof (regexList[i]) === "object") {
					result = result.concat(sh.utils.getMatches(code, regexList[i]));
				}
			}
		}
		
		// sort the matches
		return result.sort(sortCallback);
	},
	
	/**
	 * Checks to see if any of the matches are inside of other matches. 
	 * This process would get rid of highligted strings inside comments, 
	 * keywords inside strings and so on.
	 */
	removeNestedMatches: function(matches)
	{
		// Optimized by Jose Prado (http://joseprado.com)
		for (var i = 0; i < matches.length; i++) 
		{ 
			if (!matches[i]) {
				continue;
			}
			
			var itemI = matches[i],
				itemIEndPos = itemI.index + itemI.length
				;
			
			for (var j = i + 1; j < matches.length && matches[i]; j++) 
			{
				var itemJ = matches[j];
				
				if (!itemJ) {
					continue;
				}
				else if (itemJ.index > itemIEndPos) {
					break;
				}
				else if (itemJ.index == itemI.index && itemJ.length > itemI.length) {
					matches[i] = null;
				}
				else if (itemJ.index >= itemI.index && itemJ.index < itemIEndPos) {
					matches[j] = null;
				}
			}
		}
		return matches;
	},
	
	/**
	 * Creates the HTML for displaying line numbers.
	 * @param {int} lineNumber	The current line number.
	 * @return {String}			The desired HTML, as a String.
	 */
	createLineNumberElem : function(lineNumber)
	{
		var lineNumberStr = formatLineNumber(lineNumber, this.padLength),
		lineNumberElem = codeClass + 'number">' + lineNumberStr + closeCode;

		return lineNumberElem;
	},

	/**
	 * Splits block of text into individual DIV lines.
	 * @param {String} code     Code to highlight.
	 * @return {String}         Returns highlighted code in HTML form.
	 */
	createDisplayLines : function(code, target)
	{
		var 
			firstLine = parseInt(this.getParam('first-line')),
			lines,
			lineClassName = 'line alt1',
			lineNumber = parseInt(this.getParam('first-line')),
			highlightedLines = this.getParam('highlight') || [],
			wrapping = this.getParam('wrap-lines'),
			i, blockStyles='', lineNumberElem = '', charWidth,
	 		styleCache = [],
			padLength = this.getParam('pad-line-numbers')
			;

		var makeLineDiv = function(line) 
		{
			var wrapped = 
				divClass + lineClassName + '">'
					+ lineNumberElem 	// From the parent function's scope
					+ spanClass + 'content">'
						+ spanClass + 'block"' 
						+ blockStyles	 // From the parent function's scope 
						+ '>'
							+ line
							// Copy & paste in IE will include newlines only
							// if we add them explicitly. (Here, we only add a
							// marker for the newline; it will be filled in later.)
							+ (lineTerm ? codeClass + 'lineTerm">' + closeCode : '')
						+ closeSpan
					+ closeSpan
				+ closeDiv
			;
			return wrapped;
		};

		// Measure width of a single space. (Don't cache the result globally,
		// as the styles may be different for other highlighters.)
		this.charWidth = charWidth = sh.utils.measureSpace(target, makeLineDiv);
		
		lines = (typeof(code) === "string" ? code.split('\n') : code);
		code = '';

		//	Normalize padLength to an integer.
		if (padLength === true) {
			padLength = (firstLine + lines.length - 1).toString().length;
		}
		else if (isNaN(padLength)) {
			padLength = 0;
		}
		this.padLength = padLength;

		this.lastLineNumber = lineNumber + lines.length - 1;

		for (i = 0; i < lines.length; i++, lineNumber++)
		{
			var line = lines[i],
				indent = /^((&nbsp;)|\u00A0|\s)+/.exec(line),
			highlighted = indexOf(highlightedLines, lineNumber.toString()) !== -1
				;

			lineClassName = 'line alt' + ((i % 2) + 1);

			if (indent) {
				indent = indent[0].replace(/(&nbsp;)|\u00A0/g, aSpace);
				indent = indent.length;
			}
			else {
				indent = 0;
			}

			// Replace runs of two sequential spaces with '&nbsp;&nbsp;'.
			// If left alone, spaces should show up OK in the browser window thanks to CSS,
			// but they are collapsed if copied & pasted out of the window.
			line = line.replace(/ {2}/g, '&nbsp;&nbsp;');

			// Similarly: Empty lines won't be copied into the paste buffer, so we use an nbsp
			// to make them act as if they're non-empty (which, of course, they now are :-)
			if (sh.regexLib.allSpaces.test(line)) {
				line = codeClass + 'blankLine">' + '\u00A0' + closeCode;
			}

			if (highlighted)
				lineClassName += ' highlighted';
				
			if (this.hasGutter) {
				lineNumberElem = this.createLineNumberElem(lineNumber);
			}


			if (wrapping) {
				if (!(blockStyles = styleCache[indent])) {

					var ind = (indent + 3) * charWidth;
					blockStyles = 'style="text-indent: -' + ind  + 'px !important; ' +
						'padding-left: ' + ind + 'px !important; ' +
						'background-position: ' + (indent*charWidth) + 'px 1.2em !important;"';
					styleCache[indent] = blockStyles;
				}
			}
			code += makeLineDiv(line);
		}
		
		return code;
	},
	
	/**
	 * Finds all matches in the source code.
	 * @param {String} code		Source code to process matches in.
	 * @param {Array} matches	Discovered regex matches.
	 * @return {String} Returns formatted HTML with processed mathes.
	 */
	processMatches: function(code, matches)
	{
		var pos = 0, 
			result = '',
			match,
			decorate = sh.utils.decorate // make an alias to save some bytes

			// Bug in original 2.1.364 from Alex. 'brush-name' should be 'brush'.  (dbreslau)
			// var defaultBrushName = this.getParam('brush-name', '')
			// var defaultBrushName = this.getParam('brush', '') // Not currently used anyway. (dbreslau)
			;
		
		var getCSSClassNames = function(match, css)
		{
			// This was added in 2.1.364, apparently with the intent of prepending the brush
			// name as a CSS class name. However, it didn't work due to the bug above. I've 
			// disabled the functionality here: I'm not sure how useful it is, and some brush
			// names (e.g., C#) may not be valid CSS class names.
			// -- dbreslau 2009-12-18.
			/* var brushName = (match && match.highlighter && match.highlighter.scriptBrushName)
			 * || defaultBrushName || "";
			 * return brushName + ' ' + css;
			 */

			return css;
		};

		// Go through the final list of matches and pull them all
		// together, including everything in between that isn't a match.
		for (var i = 0; i < matches.length; i++) 
		{
			match = matches[i];

			if (!match) {
				continue;
			}
			
			result += decorate(code.substr(pos, match.index - pos), getCSSClassNames(match, 'plain'))
				+ decorate(match.value, getCSSClassNames(match, match.css))
				;

			pos = match.index + match.length;
		}

		// Add the remainder of the string
		result += decorate(code.substr(pos), 'plain');
		return result;
	},

	toggleLineNumbers: function()
	{
		var
		thisHL = this,
		hDiv = this.div,
		turnGutterOn = !this.hasGutter,
		lineNumber = parseInt(this.getParam('first-line')),
		divClassName = hDiv.className
		;


		try {
			if (turnGutterOn) {
				divClassName = divClassName.replace(/ ?nogutter/, '');
				sh.forEach('div.line', hDiv, function(that) {
					if (sh.hasClass(that, 'title')) {
						return;
					}

					var codeElem = createElement('code', 'number');
					if (!sh.hasClass(that, 'rulerLine')) {
						codeElem.innerHTML = formatLineNumber(lineNumber++, thisHL.padLength);
					}

					that.insertBefore(codeElem, that.firstChild);
					setCSS(that, "width", 'auto');
				});
			}
			else {
				divClassName = divClassName + ' nogutter';
				sh.forEach('code.number', hDiv, function(that){
					// Reset each line width to 'auto', so lines won't be wider than necessary
					setCSS(that.parentNode, "width", 'auto');
					that.parentNode.removeChild(that);
				});
			}
			this.hasGutter = turnGutterOn;
			this.layoutChanged = true;
			hDiv.className = divClassName;
			thisHL.startBackgroundFix();
		}
		catch (ex) {
			sh.utils.alert(ex.message);
		}	
	},

	startBackgroundFix: function()
	{
		// This method might be called before the highlighter div
		// has been inserted into the DOM. By using a timeout,
		// we can be sure that the DOM insertion will have happened
		// before we call fixLineBackgrounds().
		var thisHL = this;
		window.setTimeout(function() {
			thisHL.fixLineBackgrounds();
		}, 1);
	},

	// Dan Breslau outofwhatbox.com (with assist from stackoverflow.com user brianpeiris)
	// Ensure that each content <span> is sized to fit the width of the scrolling region.
	// (When there is no horizontal scrollbar, use the width of the parent.)
	fixLineBackgrounds: function()
	{
		var fixGutter = function(hl, linesDiv, allLines)
		{
			// The browser may leave gaps between some number elements; this seems
			// to happen when displayed lines use fonts that have slight variations
			// in their height metrics.
			//
			// To work around this, we stretch the first line number element
			// vertically, so that it fills the lines div. This leaves it 'behind'
			// the other line number elements, filling in any gaps between them.

			var top, bottom, titleElem,
				firstNum = sh.find('code.number', linesDiv),
				lastDiv = allLines[allLines.length - 1];

			if (!firstNum) {
				return;
			}
			firstNum = firstNum[0];
			if (!sh.hasClass(firstNum, 'bg')) {
				firstNum.className += ' bg';
			}

			top = firstNum.parentNode.offsetTop;
			bottom = (lastDiv.offsetTop + lastDiv.offsetHeight);
			var height = (bottom - top);

			setCSS(firstNum, "top", top + "px");
			setCSS(firstNum, "height", height + "px");

		};

		var div = this.div, 
			hasRuler = this.getParam('ruler'),
			parentNode;

		if (!div || !(parentNode = div.parentNode)) {
			return;
		}

		var	parentWidth = parentNode.scrollWidth,
			newHL = (!(this.lastParentWidth)),
			linesDiv, allLines, isWrapping
			;

		if (!newHL) {
			// Not a brand-new highlighter
			if (! (this.layoutChanged || (this.lastParentWidth !== parentWidth))) {
				return;
			}
		}
		this.layoutChanged = false;
		this.lastParentWidth = parentWidth;

		isWrapping = this.getParam('wrap-lines');
		if (isWrapping && !this.hasGutter) {
			return;
		}

		// There should be exactly one 'lines' instance under this div
		linesDiv = sh.find('div.lines', div)[0];
		allLines = sh.find('div.line', linesDiv);

		if (!(allLines && allLines[0])) {
			return;
		}

		if (this.hasGutter) {
			fixGutter(this, linesDiv, allLines);
		}

		if (!isWrapping) {
			var scrollWidth = linesDiv.parentNode.scrollWidth;
			setCSS(linesDiv, "width", scrollWidth + "px");
		}
	},

	/**
	 * Computes the maximum line length to be used in the ruler. (May
	 * return a hard-coded value if the browser doesn't support this feature.)
	 */
	maxLineLength: function(lines)
	{
		var maxLen = 0, defaultLen = 150;

		var text = getElemText(lines);
		if (!text || text.length === 0) {
			return defaultLen;
		}

		sh.forEach('span.content', lines, function(that){
			text = getElemText(that);
			if (text && text.length > maxLen) {
				maxLen = text.length;
			}
		});

		return maxLen;
	},

	/**
	 * Highlights the code and returns complete HTML.
	 * @param {String} code     Code to highlight.
	 * @param {Object} params   Parameters object.
	 */
	highlight: function(target, params)
	{
		var addLineTerm = function(lines)
		{
			if (!lineTerm) {
				return;
			}

			// Find the DOM elements that were added by createDisplayLines
			// to hold newlines. Create text elements for the newlines, and
			// add them to the tree. (This is apparently more reliable than
			// updating innerHTML to add the newlines.)
			sh.forEach('code.lineTerm', lines, function(that) {
				var newlineElem = document.createTextNode(lineTerm);
				that.appendChild(newlineElem);
			});
		};

		var unescape = function(str) {
			str = str.replace(/&amp;/g, '&');
			str = str.replace(/&lt;/g, '<');
			str = str.replace(/&gt;/g, '>');
			return str;
		};


		// using variables for shortcuts because JS compressor will shorten local variable names
		var conf = sh.config,
			code = target.innerHTML,
			vars = sh.vars,
			div, scroll,
			className = 'syntaxhighlighter',
			bar, ruler, cname, title,
			matches,
			lines, titleElem
			;

		this.params = {};
		this.div = null;
		this.id = sh.utils.guid('highlighter_');

		// register this instance in the highlighters list
		vars.highlighters[this.id] = this;

		code = code || '' ;

		// local params take precedence over defaults
		this.params = sh.utils.merge(sh.defaults, params || {});

		// process light mode
		if (this.getParam('light')) {
			this.params.toolbar = this.params.gutter = false;
		}

		// make collapsed
		if (this.getParam('collapse')) {
			className += ' collapsed';
		}

		// disable gutter
		this.hasGutter = this.getParam('gutter');
		if (!this.hasGutter) {
			className += ' nogutter';
		}
		
		// add custom user style name
		if ((cname = this.getParam('class-name'))) {
			className += aSpace + cname;
		}

		this.div = div = createElement('div', className);
		div.id = this.id;

		lines = createElement('div', 'lines');

		if (!this.getParam('wrap-lines')) {
			// Disable line wrapping
		 	lines.className += ' no-wrap';

			// Since line wrapping is disabled, use an outer div to provide
			// the scrollbar, so that mousing over the scrollbar doesn't
			// cause the toolbar to pop up. (That's a bit distracting.)
			scroll = createElement('div', 'scroll');
			scroll.appendChild(lines);
			div.appendChild(scroll);
		}
		else {
			div.appendChild(lines);
		}
		
		if (/SCRIPT/i.test(target.nodeName)) {
			code = stripCData(code);
		}

		this.originalCode = code;
		code = sh.utils.trimFirstAndLastLines(code)
			.replace(/\r/g, aSpace) // IE lets these buggers through
			;

		code = sh.utils.fixBrs(code);
		code = sh.utils.fixWhitespace(code, this.getParam('tab-size'), this.getParam('smart-tabs'));
		code = unescape(code);

		matches = this.findMatches(this.regexList, code);
		matches = this.removeNestedMatches(matches);
		code = this.processMatches(code, matches);
		// Split all lines so that they wrap well
		code = this.createDisplayLines(code, target);
		
		// finally, process the links
		if (this.getParam('auto-links')) {
			code = sh.utils.processUrls(code);
		}

		lines.innerHTML = code;
		addLineTerm(lines);

		if (this.getParam('ruler')) {
			ruler = sh.utils.createRuler(this.hasGutter, this.maxLineLength(lines));
			lines.insertBefore(ruler, lines.firstChild);
		}

		if ((title = this.getParam('title'))) {
			this.title = title;
			titleElem = createElement('div', 'line title plain');

			// The '&nbsp;' ensures that the parent <div> has content that's part of
			// the normal flow. Without this, the title bar collapses, and the title text
			// would be displayed inside the code block.  (Gotta love CSS...)
			title = '&nbsp;' + spanClass + 'title">' + title + closeSpan;
			titleElem.innerHTML = title;
			lines.insertBefore(titleElem, lines.firstChild);
		}

		// add controls toolbar
		if (this.getParam('toolbar')) {
			bar = createElement('div', 'bar');
			bar.appendChild(sh.toolbar.create(this));
			lines.insertBefore(bar, lines.firstChild);

			if (isMSIE6) {
				// IE6 doesn't support CSS hovers. (And see note below about IE7.)
				var hide = function() {
					div.className = div.className.replace(/ ?showToolbar/, '');
				};

				div.onmouseover = function() {
					hide();
					div.className += ' showToolbar';
				};
				div.onmouseout = hide;
			}

			if (isMSIE6 || isMSIE7) {
				// The browser is IE6 or 7. IE7 (at least, IE8 in Compatibility View)
				// doesn't trigger the hover on 'lines' unless the mouse is over text.
				// Adding the 'ieHover' class to the top-level div will make it provide
				// the hovers, instead of the 'lines' div. 
				// 
				// The drawback to this is that the hover is activated simply by using
				// the scrollbar, which is a bit of a nuisance.  (There may be another
				// way around the problem, but I haven't found it yet.) -- dbreslau
				div.className += ' ieHover';

				if (scroll) {
					scroll.className += ' ieFix';
				}
			}
		}
		

	

		this.startBackgroundFix();
		return div;
	},
	
	/**
	 * Converts space separated list of keywords into a regular expression string.
	 * @param {String} str    Space separated keywords.
	 * @return {String}       Returns regular expression string.
	 */	
	getKeywords: function(str)
	{
		str = str
			.replace(/^\s+|\s+$/g, '')
			.replace(/\s+/g, '|')
			;

		return '\\b(?:' + str + ')\\b';
	},
	
	/**
	 * Makes a brush compatible with the `html-script` functionality.
	 * @param {Object} regexGroup Object containing `left` and `right` regular expressions.
	 */
	forHtmlScript: function(regexGroup)
	{
		this.htmlScript = {
			left : { regex: regexGroup.left, css: 'script' },
			right : { regex: regexGroup.right, css: 'script' },
			code : new XRegExp(
				"(?<left>" + regexGroup.left.source + ")" +
				"(?<code>.*?)" +
				"(?<right>" + regexGroup.right.source + ")",
				"sgi"
				)
		};
	},

	getTitle : function()
	{
		return this.title;
	}
	
}; // end of Highlighter



return sh;
}(); // end of anonymous function





}


/**
 * XRegExp 0.6.1
 * (c) 2007-2008 Steven Levithan
 * <http://stevenlevithan.com/regex/xregexp/>
 * MIT License
 * 
 * provides an augmented, cross-browser implementation of regular expressions
 * including support for additional modifiers and syntax. several convenience
 * methods and a recursive-construct parser are also included.
 */

// prevent running twice, which would break references to native globals
if (!window.XRegExp) {
// anonymous function to avoid global variables
(function () {
// copy various native globals for reference. can't use the name ``native``
// because it's a reserved JavaScript keyword.
var real = {
        exec:    RegExp.prototype.exec,
        match:   String.prototype.match,
        replace: String.prototype.replace,
        split:   String.prototype.split
    },
    /* regex syntax parsing with support for all the necessary cross-
       browser and context issues (escapings, character classes, etc.) */
    lib = {
        part:       /(?:[^\\([#\s.]+|\\(?!k<[\w$]+>|[pP]{[^}]+})[\S\s]?|\((?=\?(?!#|<[\w$]+>)))+|(\()(?:\?(?:(#)[^)]*\)|<([$\w]+)>))?|\\(?:k<([\w$]+)>|[pP]{([^}]+)})|(\[\^?)|([\S\s])/g,
        replaceVar: /(?:[^$]+|\$(?![1-9$&`']|{[$\w]+}))+|\$(?:([1-9]\d*|[$&`'])|{([$\w]+)})/g,
        extended:   /^(?:\s+|#.*)+/,
        quantifier: /^(?:[?*+]|{\d+(?:,\d*)?})/,
        classLeft:  /&&\[\^?/g,
        classRight: /]/g
    },
    indexOf = function (array, item, from) {
        for (var i = from || 0; i < array.length; i++)
            if (array[i] === item) return i;
        return -1;
    },
    brokenExecUndef = /()??/.exec("")[1] !== undefined,
    plugins = {};

/**
 * Accepts a pattern and flags, returns a new, extended RegExp object.
 * differs from a native regex in that additional flags and syntax are
 * supported and browser inconsistencies are ameliorated.
 * @ignore
 */
XRegExp = function (pattern, flags) {
    if (pattern instanceof RegExp) {
        if (flags !== undefined)
            throw TypeError("can't supply flags when constructing one RegExp from another");
        return pattern.addFlags(); // new copy
    }

    var flags           = flags || "",
        singleline      = flags.indexOf("s") > -1,
        extended        = flags.indexOf("x") > -1,
        hasNamedCapture = false,
        captureNames    = [],
        output          = [],
        part            = lib.part,
        match, cc, len, index, regex;

    part.lastIndex = 0; // in case the last XRegExp compilation threw an error (unbalanced character class)

    while (match = real.exec.call(part, pattern)) {
        // comment pattern. this check must come before the capturing group check,
        // because both match[1] and match[2] will be non-empty.
        if (match[2]) {
            // keep tokens separated unless the following token is a quantifier
            if (!lib.quantifier.test(pattern.slice(part.lastIndex)))
                output.push("(?:)");
        // capturing group
        } else if (match[1]) {
            captureNames.push(match[3] || null);
            if (match[3])
                hasNamedCapture = true;
            output.push("(");
        // named backreference
        } else if (match[4]) {
            index = indexOf(captureNames, match[4]);
            // keep backreferences separate from subsequent literal numbers
            // preserve backreferences to named groups that are undefined at this point as literal strings
            output.push(index > -1 ?
                "\\" + (index + 1) + (isNaN(pattern.charAt(part.lastIndex)) ? "" : "(?:)") :
                match[0]
            );
        // unicode element (requires plugin)
        } else if (match[5]) {
            output.push(plugins.unicode ?
                plugins.unicode.get(match[5], match[0].charAt(1) === "P") :
                match[0]
            );
        // character class opening delimiter ("[" or "[^")
        // (non-native unicode elements are not supported within character classes)
        } else if (match[6]) {
            if (pattern.charAt(part.lastIndex) === "]") {
                // for cross-browser compatibility with ECMA-262 v3 behavior,
                // convert [] to (?!) and [^] to [\S\s].
                output.push(match[6] === "[" ? "(?!)" : "[\\S\\s]");
                part.lastIndex++;
            } else {
                // parse the character class with support for inner escapes and
                // ES4's infinitely nesting intersection syntax ([&&[^&&[]]]).
                cc = XRegExp.matchRecursive("&&" + pattern.slice(match.index), lib.classLeft, lib.classRight, "", {escapeChar: "\\"})[0];
                output.push(match[6] + cc + "]");
                part.lastIndex += cc.length + 1;
            }
        // dot ("."), pound sign ("#"), or whitespace character
        } else if (match[7]) {
            if (singleline && match[7] === ".") {
                output.push("[\\S\\s]");
            } else if (extended && lib.extended.test(match[7])) {
                len = real.exec.call(lib.extended, pattern.slice(part.lastIndex - 1))[0].length;
                // keep tokens separated unless the following token is a quantifier
                if (!lib.quantifier.test(pattern.slice(part.lastIndex - 1 + len)))
                    output.push("(?:)");
                part.lastIndex += len - 1;
            } else {
                output.push(match[7]);
            }
        } else {
            output.push(match[0]);
        }
    }

    regex = RegExp(output.join(""), real.replace.call(flags, /[sx]+/g, ""));
    regex._x = {
        source:       pattern,
        captureNames: hasNamedCapture ? captureNames : null
    };
    return regex;
};

/**
 * Barebones plugin support for now (intentionally undocumented)
 * @ignore
 * @param {Object} name
 * @param {Object} o
 */
XRegExp.addPlugin = function (name, o) {
    plugins[name] = o;
};

/**
 * Adds named capture support, with values returned as ``result.name``.
 * 
 * Also fixes two cross-browser issues, following the ECMA-262 v3 spec:
 *  - captured values for non-participating capturing groups should be returned
 *    as ``undefined``, rather than the empty string.
 *  - the regex's ``lastIndex`` should not be incremented after zero-length
 *    matches.
 * @ignore
 */
RegExp.prototype.exec = function (str) {
    var match = real.exec.call(this, str),
        name, i, r2;
    if (match) {
        // fix browsers whose exec methods don't consistently return
        // undefined for non-participating capturing groups
        if (brokenExecUndef && match.length > 1) {
            // r2 doesn't need /g or /y, but they shouldn't hurt
            r2 = new RegExp("^" + this.source + "$(?!\\s)", this.getNativeFlags());
            real.replace.call(match[0], r2, function () {
                for (i = 1; i < arguments.length - 2; i++) {
                    if (arguments[i] === undefined) match[i] = undefined;
                }
            });
        }
        // attach named capture properties
        if (this._x && this._x.captureNames) {
            for (i = 1; i < match.length; i++) {
                name = this._x.captureNames[i - 1];
                if (name) match[name] = match[i];
            }
        }
        // fix browsers that increment lastIndex after zero-length matches
        if (this.global && this.lastIndex > (match.index + match[0].length))
            this.lastIndex--;
    }
    return match;
};
})(); // end anonymous function
} // end if(!window.XRegExp)

/**
 * intentionally undocumented
 * @ignore
 */
RegExp.prototype.getNativeFlags = function () {
    return (this.global     ? "g" : "") +
           (this.ignoreCase ? "i" : "") +
           (this.multiline  ? "m" : "") +
           (this.extended   ? "x" : "") +
           (this.sticky     ? "y" : "");
};

/**
 * Accepts flags; returns a new XRegExp object generated by recompiling
 * the regex with the additional flags (may include non-native flags).
 * The original regex object is not altered.
 * @ignore
 */
RegExp.prototype.addFlags = function (flags) {
    var regex = new XRegExp(this.source, (flags || "") + this.getNativeFlags());
    if (this._x) {
        regex._x = {
            source:       this._x.source,
            captureNames: this._x.captureNames ? this._x.captureNames.slice(0) : null
        };
    }
    return regex;
};

/**
 * Accepts a context object and string; returns the result of calling
 * ``exec`` with the provided string. the context is ignored but is
 * accepted for congruity with ``Function.prototype.call``.
 * @ignore
 */
RegExp.prototype.call = function (context, str) {
    return this.exec(str);
};

/**
 * Accepts a context object and arguments array; returns the result of
 * calling ``exec`` with the first value in the arguments array. the context
 * is ignored but is accepted for congruity with ``Function.prototype.apply``.
 * @ignore
 */
RegExp.prototype.apply = function (context, args) {
    return this.exec(args[0]);
};

/**
 * Accepts a pattern and flags; returns an XRegExp object. if the pattern
 * and flag combination has previously been cached, the cached copy is
 * returned, otherwise the new object is cached.
 * @ignore
 */
XRegExp.cache = function (pattern, flags) {
    var key = "/" + pattern + "/" + (flags || "");
    return XRegExp.cache[key] || (XRegExp.cache[key] = new XRegExp(pattern, flags));
};

/**
 * Accepts a string; returns the string with regex metacharacters escaped.
 * the returned string can safely be used within a regex to match a literal
 * string. escaped characters are [, ], {, }, (, ), -, *, +, ?, ., \, ^, $,
 * |, #, [comma], and whitespace.
 * @ignore
 */
XRegExp.escape = function (str) {
    return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
};

/**
 * Accepts a string to search, left and right delimiters as regex pattern
 * strings, optional regex flags (may include non-native s, x, and y flags),
 * and an options object which allows setting an escape character and changing
 * the return format from an array of matches to a two-dimensional array of
 * string parts with extended position data. returns an array of matches
 * (optionally with extended data), allowing nested instances of left and right
 * delimiters. use the g flag to return all matches, otherwise only the first
 * is returned. if delimiters are unbalanced within the subject data, an error
 * is thrown.
 * 
 * This function admittedly pushes the boundaries of what can be accomplished
 * sensibly without a "real" parser. however, by doing so it provides flexible
 * and powerful recursive parsing capabilities with minimal code weight.
 * 
 * Warning: the ``escapeChar`` option is considered experimental and might be
 * changed or removed in future versions of XRegExp.
 * 
 * unsupported features:
 *  - backreferences within delimiter patterns when using ``escapeChar``.
 *  - although providing delimiters as regex objects adds the minor feature of
 *    independent delimiter flags, it introduces other limitations and is only
 *    intended to be done by the ``XRegExp`` constructor (which can't call
 *    itself while building a regex).
 * 
 * @ignore
 */
XRegExp.matchRecursive = function (str, left, right, flags, options) {
    var options      = options || {},
        escapeChar   = options.escapeChar,
        vN           = options.valueNames,
        flags        = flags || "",
        global       = flags.indexOf("g") > -1,
        ignoreCase   = flags.indexOf("i") > -1,
        multiline    = flags.indexOf("m") > -1,
        sticky       = flags.indexOf("y") > -1,
        /* sticky mode has its own handling in this function, which means you
           can use flag "y" even in browsers which don't support it natively */
        flags        = flags.replace(/y/g, ""),
        left         = left  instanceof RegExp ? (left.global  ? left  : left.addFlags("g"))  : new XRegExp(left,  "g" + flags),
        right        = right instanceof RegExp ? (right.global ? right : right.addFlags("g")) : new XRegExp(right, "g" + flags),
        output       = [],
        openTokens   = 0,
        delimStart   = 0,
        delimEnd     = 0,
        lastOuterEnd = 0,
        outerStart, innerStart, leftMatch, rightMatch, escaped, esc;

    if (escapeChar) {
        if (escapeChar.length > 1) throw SyntaxError("can't supply more than one escape character");
        if (multiline)             throw TypeError("can't supply escape character when using the multiline flag");
        escaped = XRegExp.escape(escapeChar);
        /* Escape pattern modifiers:
            /g - not needed here
            /i - included
            /m - **unsupported**, throws error
            /s - handled by XRegExp when delimiters are provided as strings
            /x - handled by XRegExp when delimiters are provided as strings
            /y - not needed here; supported by other handling in this function
        */
        esc = new RegExp(
            "^(?:" + escaped + "[\\S\\s]|(?:(?!" + left.source + "|" + right.source + ")[^" + escaped + "])+)+",
            ignoreCase ? "i" : ""
        );
    }

    while (true) {
        /* advance the starting search position to the end of the last delimiter match.
           a couple special cases are also covered:
            - if using an escape character, advance to the next delimiter's starting position,
              skipping any escaped characters
            - first time through, reset lastIndex in case delimiters were provided as regexes
        */
        left.lastIndex = right.lastIndex = delimEnd +
            (escapeChar ? (esc.exec(str.slice(delimEnd)) || [""])[0].length : 0);

        leftMatch  = left.exec(str);
        rightMatch = right.exec(str);

        // only keep the result which matched earlier in the string
        if (leftMatch && rightMatch) {
            if (leftMatch.index <= rightMatch.index)
                 rightMatch = null;
            else leftMatch  = null;
        }

        /* paths*:
        leftMatch | rightMatch | openTokens | result
        1         | 0          | 1          | ...
        1         | 0          | 0          | ...
        0         | 1          | 1          | ...
        0         | 1          | 0          | throw
        0         | 0          | 1          | throw
        0         | 0          | 0          | break
        * - does not include the sticky mode special case
          - the loop ends after the first completed match if not in global mode
        */

        if (leftMatch || rightMatch) {
            delimStart = (leftMatch || rightMatch).index;
            delimEnd   = (leftMatch ? left : right).lastIndex;
        } else if (!openTokens) {
            break;
        }

        if (sticky && !openTokens && delimStart > lastOuterEnd)
            break;

        if (leftMatch) {
            if (!openTokens++) {
                outerStart = delimStart;
                innerStart = delimEnd;
            }
        } else if (rightMatch && openTokens) {
            if (!--openTokens) {
                if (vN) {
                    if (vN[0] && outerStart > lastOuterEnd)
                               output.push([vN[0], str.slice(lastOuterEnd, outerStart), lastOuterEnd, outerStart]);
                    if (vN[1]) output.push([vN[1], str.slice(outerStart,   innerStart), outerStart,   innerStart]);
                    if (vN[2]) output.push([vN[2], str.slice(innerStart,   delimStart), innerStart,   delimStart]);
                    if (vN[3]) output.push([vN[3], str.slice(delimStart,   delimEnd),   delimStart,   delimEnd]);
                } else {
                    output.push(str.slice(innerStart, delimStart));
                }
                lastOuterEnd = delimEnd;
                if (!global)
                    break;
            }
        } else {
            // reset lastIndex in case delimiters were provided as regexes
            left.lastIndex = right.lastIndex = 0;
            throw Error("subject data contains unbalanced delimiters");
        }

        // if the delimiter matched an empty string, advance delimEnd to avoid an infinite loop
        if (delimStart === delimEnd)
            delimEnd++;
    }

    if (global && !sticky && vN && vN[0] && str.length > lastOuterEnd)
        output.push([vN[0], str.slice(lastOuterEnd), lastOuterEnd, str.length]);

    // reset lastIndex in case delimiters were provided as regexes
    left.lastIndex = right.lastIndex = 0;

    return output;
};
