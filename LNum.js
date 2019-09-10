// Tue Sep  3 16:05:41     2019
// v 0.2: vanilla javascript (a bit more suckless - does not rely on
// jQuery and jcanvas anymore).
/**
 * @class LNum
 * @author Marcus Oettinger <info@oettinger-physics.de>
 * @version 0.2
 * @license MIT License
 * @see {@link https://marcusoettinger.github.io/LNum.js|LNum Example}
 * LNum ( a, b, cnv): LNum constructor
 * @param{number} a: start of interval [a,b]
 * @param{number} b: end of interval
 * @param{object} cnv: the canvas to draw on
 */
function LNum( a, b, cnv) {
        // Private:
        // -----------------------------------------------------------------------------
        // paranoia mode: some reasonable defaults
        var _margin = 50;	// margin around the plot
        var _len = 1;		// length of interval [a,b]
        var _offset = 100;		// where is zero?
        var _y = 10;
        var _left = 0;
        var _right = 1;
        var _SCALE = 10.0;	//
        var _tickLength= 3;	// length of main ticks
        var _daCanvas = cnv;	// the canvas to use
        var _dactx = _daCanvas.getContext("2d");	// the canvas to use
        var _TICKSCALE= 1;

        /** 
	 * options 
	 * @typedef {options}
	 * @property {boolean} clear - whether the canvas should be cleared
	 * @property {boolean} line - whether the numberline should be drawn
	 * @property {number} tickSpacing - 0 to autospace, draw a tick for every whole number
	 * @property {number} font Size - font size in pixel, e.g. '10', '10px'
	 * @property {string} fontFamily - the font family (default: "sans-serif")
	 * @property {number} ticklen - size of the ticks on the line (default: 10)
	 * @property {string} color - color to use for numbers and the line if set to true (default "#888")
	 * @property {number} linewidth - width of lines drawn in px (default 1)
	 */
        var _defaults = { 
            		// general plot options
            		clear: false, 		// clear canvas
            		line: false, 		// draw the number line

            		// tick spacing: use 0 to autospace, any number 
            		// n >0 to set a tick mark every n units 
            		tickSpacing: 0,

            		// options for integers plotted on the line
            		fontSize: '14px', 
            		fontFamily: "sans-serif",
            		ticklen: 10,
            		// colors
            		color: "#888", 		
			// color to use for drawing a number (in [a,b]) if line
			// is false, rsp. color of the whole line (if line is
			// true)
			linewidth: 1,
			startArrow: false,
			endArrow: false,
			arrowAngle: 45,
			arrowRadius: 10,
        };


        // check interval: paranoia mode!
        a == b? b=a+10:b;
        _left = min(a,b);
        _right = max(a,b);

        /**
	 *
	 * extend(): mimick the jQuery.extend() function (merge the 
	 * contents of two or more objects together into the first 
	 * object).
	 * @private
         * @param { Object } target
	 * @param {Object } [ object1 ]
	 * @param {object } [ objectN ] 
	 */
        function extend(){
	    for(var i=1; i<arguments.length; i++)
	        for(var key in arguments[i])
	            if(arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	}


        // calculate coordinates of a number on the canvas
        function _XScaled(x) { return _SCALE * x; };
        function _XPos(x) { return _offset + _XScaled(x); };
        function _YPos(y) { return _y };

        // return the sign of a number x (this ought to be fast and safe)
        function sign(x) { return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; }

        // minimum in the sense of: b if b<a, a otherwise.
        function min(a,b){ if (b<a){ return b; } return a; };

        // maximum in the sense of: b if b>a, a otherwise.
        function max(a,b){ if (b>a){ return b; } return a; };

	// check if the string input end with search
	function endsWith(input, search) {
		var index = input.length - search.length;
		return index >= 0 && input.indexOf(search, index) > -1;
	}


	/**
	 *
	 * _setFont: set the font to use on the canvas context.
	 * @private
         * @param { ctx } the context
         * @param { params } options ('fontSize' and 'fontFamily' are used to define a font)
	 */
	function _setFont(ctx, params) {
		var str = params.fontSize;
		// convert size to the form 'XXpx'
		if (endsWith(str, 'px') == false) {
			while (isNaN(str) && str.length > 1) str = str.substring(0, str.length - 1);
			str = str + 'px';
		}
		ctx.font = str + ' ' + params['fontFamily'];
	}


        /**
	 *
	 * SetScale: calculate a reasonable scale to plot a number line from a to b on the canvas
	 * @private
         * @param { settings } options - LNum {@link options}
	 */
        function setScale( settings ) {
                    _len = _right - _left;
                    _SCALE = (_daCanvas.width - 2 * _margin) / _len;
			// Position of Zero
                    _offset = _margin - (_SCALE * min(a,b));       
                    _y = _daCanvas.height/2 + _margin;
                    if (settings.tickSpacing == 0) {
                        while (_len /_TICKSCALE > 10) {
                           _TICKSCALE= _TICKSCALE+1; 
                        }
                        // if (_TICKSCALE >10) _TICKSCALE= _TICKSCALE*2;
                    } else {
                        _TICKSCALE = settings.tickSpacing;
                    }
        } // SetScale
        
        // the drawing primitives used: line (with arrow heads if desired),
        // text, rectangle
        
        // Adds arrow to path using the given properties
	function _addArrow(ctx, params, x1, y1, x2, y2) {
		var leftX, leftY,
			rightX, rightY,
			offsetX, offsetY,
			atan2 = Math.atan2,
			PI = Math.PI,
			round = Math.round,
			abs = Math.abs,
			sin = Math.sin,
			cos = Math.cos,
			angle;

		// If arrow radius is given
		if (params.arrowRadius) {
			// Calculate angle
			angle = atan2((y2 - y1), (x2 - x1));
			// Adjust angle correctly
			angle -= PI;
			// Calculate offset to place arrow at edge of path
			offsetX = (params.linewidth* cos(angle));
			offsetY = (params.linewidth* sin(angle));

			// Calculate coordinates for left half of arrow
			leftX = x2 - (params.arrowRadius * cos(angle + (params.arrowAngle / 2)));
			leftY = y2 + (params.arrowRadius * sin(angle + (params.arrowAngle / 2)));
			// Calculate coordinates for right half of arrow
			rightX = x2 - (params.arrowRadius * cos(angle - (params.arrowAngle / 2)));
			rightY = y2 + (params.arrowRadius * sin(angle - (params.arrowAngle / 2)));

			// Draw left half of arrow
			ctx.moveTo(leftX - offsetX, leftY - offsetY);
			ctx.lineTo(x2 - offsetX, y2 - offsetY);
			// Draw right half of arrow
			ctx.lineTo(rightX - offsetX, rightY - offsetY);

			// Visually connect arrow to path
			ctx.moveTo(x2 - offsetX, y2 - offsetY);
			ctx.lineTo(x2 + offsetX, y2 + offsetY);
			// Move back to end of path
			ctx.moveTo(x2, y2);
		}
	}


	/** _drawLine: draw a line on the canvas. Start and end point
	 * of the line are x1/y1 and x2/y2 in the array of settings.
	 * @private
	 * @param { params } options - LNum {@link options}
	 * @param { options } options - LNum {@link options}
	 * @example _drawLine({ color: 'red', linewidth: 2,
	 * x1: 1, y1: 1, x2: 10, y2: 10, endArrow: true })
	 */
        function _drawLine(params, options) {
        	if ( _dactx == null ) return;
		var settings= extend( {}, params, options);
		_dactx.strokeStyle = settings.color;
		_dactx.strokeWidth = settings.linewidth;
		_dactx.beginPath();
	       	_dactx.moveTo(settings['x1'], settings['y1']);
	       	_dactx.lineTo(settings['x2'], settings['y2']);

		if (settings.endArrow)
			_addArrow(_dactx, settings, settings.x1, settings.y1, settings.x2, settings.y2);
		if (settings.startArrow)
			_addArrow(_dactx, settings, settings.x2, settings.y2, settings.x1, settings.y1);
			
		_dactx.stroke();
        }
        
       /** _drawText: draw text on the canvas at x/y (centered) using
       	 * the given options.
	 * @private
	 * @param { params } options - LNum {@link options}
	 * @param { options } options - LNum {@link options}
	 * @example _drawText({ color: 'red', x: 10, y: 20,
	 * fontSize: '24px', fontFamily: 'Arial', text: 'Hallo Welt' })
	 */
        function _drawText(params, options) {
		if ( _dactx == null ) return;
		var settings = extend( {}, params, options);
		_dactx.beginPath();
		_dactx.strokeStyle = settings.color;
		_dactx.strokeWidth = settings.linewidth;
		_dactx.fillStyle = settings.color;
	       	_setFont(_dactx, settings);
	       	_dactx.textAlign = "center";
	       	_dactx.textBaseline = "middle";
	       	_dactx.fillText(settings['text'], settings['x'], settings['y']);
	       }
	       
	/** _drawRect: draw a rectangle on the canvas. 
	 * @private
	 * @param { params } options - LNum {@link options}
	 * @param { options } options - LNum {@link options}
	 * @example _drawRect({ color: 'red', linewidth: 3,
	 * x: 10, y: 20, width: 30, height: 10 })
	 */
	function _drawRect(params, options) {
		if ( _dactx == null ) return;
		var settings = extend( {}, params, options);
		_dactx.beginPath();
		_dactx.strokeStyle = settings.color;
		_dactx.strokeWidth = settings.linewidth;
		_dactx.rect(settings['x'], settings['y'], settings['width'], settings['height']);
		_dactx.stroke();
	       }


        /**
	 *
	 * drawtick: draw a tick mark on the number line at pos = n
	 * @private
         * @param { number } pos - where to draw the tick
         * @param { options } options - LNum {@link options}
	 */
        function drawtick(pos, options) {
                var settings = extend( {}, _defaults, options );
                
                _drawLine(settings, { endArrow: false, x1: _XPos(pos), 
			y1: _y, x2: _XPos(pos), y2: _y + _tickLength })
                _drawText(settings, { x: _XPos(pos), y: _y+15, text: pos });
        };


        /** draw the number line onto _daCanvas
	 * @private
         * @param { options } options - LNum {@link options}
        */
        function numberline(options){
               if (_daCanvas == null || _dactx == null) return;
               var settings = extend( {}, _defaults, options );

               _drawLine(settings, { endArrow: false, x1: _margin, y1: _y,
			x2: _margin + _len * _SCALE , y2: _y });
                for ( i=_left; i<=_right; i+=_TICKSCALE) {
			drawtick(i, settings);
                }
        };
        

        // =======================================================
        // Public:
        // =======================================================

        /**
         * setCanvas ( cnv ): set the canvas to draw the line on
         * @param {integer} cnv the canvas to use
         */
        this.setCanvas = function( cnv ) { 
        	_daCanvas = cnv;
        	_dactx = cnv.getContext("2d");
        };

        /**
	 * Return the current image as base64-encoded image-string
         * @param { string } type type of image
         * @returns { string }
         */
        this.getCanvasImage = function( type ) {
        	if (_daCanvas.toDataURL) {
			// JPEG quality defaults to 1
			//if (quality === undefined) {
				quality = 1;
			//}
			dataURL = _daCanvas.toDataURL('image/' + type, quality);
		} else {
			console.log('No toDataURL? Bummer!');
		}
		return dataURL;
	}


        /** 
         * drawQ( z, n, options ): draw a rational number q=(z/n) where z is a whole number and n a natural one on the number line at q = z/n.
         * @param { number } z - the numerator of the fraction
         * @param { number } n - the denominator of the fraction (not 0)
         * @param { options } options - LNum {@link options}
         */
        this.drawQ = function ( z, n , options) {
                if ( n==0 ) { 
                    alert("n in q=z/n must not be zero!");
                    return;
                }
                var settings = extend( {}, _defaults, options );
                var pos = _XPos(z/n);
                var y0 = _y-settings.ticklen;

                _drawText( settings, { x: pos, y: y0-13, text: n });
                var h = parseInt(_dactx.font.match(/\d+/), 10);
                var w = _dactx.measureText(n).width;
                
                _drawLine( settings, { endArrow: false, 
                	x1: pos , y1: _y , x2: pos, y2: y0});
                _drawLine( settings, { endArrow: false, 
                	x1: pos-w/2 , y1: y0- h -8 ,
			x2: pos+w/2, y2: y0 - h - 8});
                _drawText( settings, { x: pos, y: y0 - h -16 ,
                        text: z });
        }; /* drawQ */


        /**
	 * Draw a number on the number line at n. Decimal numbers are ok.
         * @param { number } n - the number to draw
         * @param { options } options - LNum {@link options}
         */
        this.drawN = function ( pos , options) {
                var settings = extend( {}, _defaults, options );

                _drawLine( settings, { endArrow: false,
                	x1: _XPos(pos) , y1: _y,
			x2: _XPos(pos), y2: _y - settings.ticklen })
                _drawText( settings, { x: _XPos(pos), y: _y-settings.ticklen-10,
			text: pos });
        }; /* drawN */


        /** 
         * Draw the starting value n and the step needed for n+m and the result
	 * @param {number} n - the number to start with
	 * @param {number} m - the summand to add
         * @param { options } options - LNum {@link options}
         */
        this.drawSum = function( n, m, options ) {
            var s = n + m;
            var corr = sign(m) * 4;
            if (m>0) {
                step = "+" + m.toString();
            } else {
                step = m.toString();
            }
            var settings = extend( {}, _defaults, { ticklen: 35 },  options );

		_drawLine( settings, { x1: _XPos(n), y1: _y,
			x2: _XPos(n), y2: _y - settings.ticklen })
		_drawLine( settings, { x1: _XPos(s) ,	y1: _y,
			x2: _XPos(s), y2: _y - settings.ticklen })
		_drawLine( settings, { endArrow: true,
			arrowRadius: 10, arrowAngle: 45, 
                        x1: _XPos(n) + corr, y1: _y - settings.ticklen-5,
			x2: _XPos(s) - corr , y2: _y - settings.ticklen -5 })
		_drawText( settings, { x: _XPos(n), y: _y-settings.ticklen-15,
                        text: n }); 
		_drawText( settings, { x: _XPos(n+m/2), y: _y-settings.ticklen-15,
			text: step});
		_drawText( settings, { x: _XPos(s), y: _y-settings.ticklen-15,
			text: s });

                var rec_w = _dactx.measureText(step).width + 6;
                var rec_h = parseInt(_dactx.font.match(/\d+/), 10);
    		_drawRect( settings, { x: _XPos(n+m/2) - rec_w/2 ,
    			y: _y - settings.ticklen-6, 
			width: rec_w, height: -(rec_h + 6)  });
        } // drawSum

        /** Draw the number line on the canvas set by
         * @see setCanvas.
	 * This function is used to to plot the line itself.
         * @param { options } options - LNum {@link options}
        */
        this.display = function(options){
                // handle defaults
                var settings = extend( {}, _defaults, { clear:true, line: true }, options );

                setScale( settings );
                if (settings.clear) {
                    _dactx.clearRect(0, 0, _daCanvas.width, _daCanvas.height);
                    _count = 0;
                }
                if (settings.line) numberline(settings);

        };

        // return a brandnew LNum :-)
        return this;
};
