/**
 * @class LNum
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
        var _TICKSCALE= 1;

        /** 
	 * options 
	 * @typedef {options}
	 * @property {boolean} clear - whether the canvas should be cleared
	 * @property {boolean} line - whether the line should be drawn
	 * @property {number} tickSpacing - 0 to autospace, draw a tick every number
	 * @property {number} font Size - font size in pixel
	 * @property {string} fontFamily - the font family (default: "sans-serif")
	 * @property {number} ticklen - size of the ticks on the line (default: 10)
	 * @property {string} color - color to use for numbers and the line if set to true (default "#888")
	 */
        var _defaults = { 
            		// general plot options
            		clear: false, 		// clear canvas
            		line: false, 		// draw the number line

            		// tick spacing: use 0 to autospace, any number 
            		// n >0 to set a tick mark every n units 
            		tickSpacing: 0,

            		// options for integers plotted on the line
            		fontSize: 14, 
            		fontFamily: "sans-serif",
            		ticklen: "10",
            		// colors
            		color: "#888", 		
			// color to use for drawing a number (in [a,b]) if line
			// is false, rsp. color of the whole line (if line is
			// true)
        };


        // handle interval: paranoia mode!
        a == b? b=a+10:b;
        _left = min(a,b);
        _right = max(a,b);

        // calculate coordinates of an integer on the canvas
        function _XScaled(x) { return _SCALE * x; };
        function _XPos(x) { return _offset + _XScaled(x); };
        function _YPos(y) { return _y };

        // return the sign of a number x (this ought to be fast and safe)
        function sign(x) { return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; }

        // minimum in the sense of: b if b<a, a otherwise.
        function min(a,b){ if (b<a){ return b; } return a; };

        // maximum in the sense of: b if b>a, a otherwise.
        function max(a,b){ if (b>a){ return b; } return a; };


        /**
	 *
	 * SetScale: calculate a reasonable scale to plot a number line from a to b on the canvas
	 * @private
         * @param { settings } options - LNum {@link options}
	 */
        function setScale( settings ) {
                    _len = _right - _left;
                    _SCALE = (_daCanvas.width() - 2 * _margin) / _len;
			// Position of Zero
                    _offset = _margin - (_SCALE * min(a,b));       
                    _y = _daCanvas.height()/2 + _margin;
                    if (settings.tickSpacing == 0) {
                        while (_len /_TICKSCALE > 10) {
                           _TICKSCALE= _TICKSCALE+1; 
                        }
                        // if (_TICKSCALE >10) _TICKSCALE= _TICKSCALE*2;
                    } else {
                        _TICKSCALE = settings.tickSpacing;
                    }
        } // SetScale


        /**
	 *
	 * drawtick: draw a tick mark on the number line at pos = n
	 * @private
         * @param { number } pos - where to draw the tick
         * @param { settings } options - LNum {@link options}
	 */
        function drawtick(pos, settings) {
                _daCanvas.drawLine({ strokeStyle: settings.color, 
			strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , 
			y1: _y, x2: _XPos(pos), y2: _y + _tickLength })
                _daCanvas.drawText({ strokeStyle: settings.color,
			strokeWidth: 1, x: _XPos(pos), y: _y+10,
			fontSize: settings.fontSize,
			fontFamily: settings.fontFamily, text: pos });
        };


        /** draw the number line onto _daCanvas
	 * @private
         * @param { options } options - LNum {@link options}
        */
        function numberline(options){
               if (_daCanvas == null) return;
                var settings = $.extend( {}, _defaults, options );

               _daCanvas.drawLine({ strokeStyle: settings.color,
			strokeWidth: 2, rounded: false,
			endArrow: false, x1: _margin, y1: _y,
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
        this.setCanvas = function( cnv ) {  _daCanvas = cnv; };

        /**
	 * Return the current image as base64-encoded image-string
         * @param { string } type type of image
         * @returns { string }
         */
        this.getCanvasImage = function( type ) {
		return _daCanvas.getCanvasImage( type );
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
                var settings = $.extend( {}, _defaults, options );
                var pos = _XPos(z/n);
                var y0 = _y-settings.ticklen;

                _daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: pos, y: y0-13, fontSize: settings.fontSize,
			fromCenter: true, fontFamily: settings.fontFamily,
			layer:true, name: 'nn',  text: n });
                var h = _daCanvas.measureText('nn').height;
                var w = _daCanvas.measureText('nn').width;
                
                _daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 2, rounded: false,
                        endArrow: false, x1: pos , y1: _y , x2: pos, y2: y0});
                _daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 2, rounded: false,
                        endArrow: false, x1: pos-w/2 , y1: y0- h -8 ,
			x2: pos+w/2, y2: y0 - h - 8});
                _daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: pos, y: y0 - h -16 , fontSize: settings.fontSize,
			fontFamily: settings.fontFamily,
                        text: z });
        }; /* drawQ */


        /**
	 * Draw a number on the number line at n. Decimal numbers are ok.
         * @param { number } n - the number to draw
         * @param { options } options - LNum {@link options}
         */
        this.drawN = function ( pos , options) {
                var settings = $.extend( {}, _defaults, options );

                _daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , y1: _y,
			x2: _XPos(pos), y2: _y - settings.ticklen })
                _daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(pos), y: _y-settings.ticklen-10,
			fontSize: settings.fontSize,
			fontFamily: settings.fontFamily, text: pos });
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
            var settings = $.extend(  _defaults, 
		    { ticklen: 35 },  options );
		_daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 1, rounded: false,
                        endArrow: false, x1: _XPos(n) ,
			y1: _y, x2: _XPos(n), y2: _y - settings.ticklen })
		_daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 1, rounded: false,
                        endArrow: false, x1: _XPos(s) ,
			y1: _y, x2: _XPos(s), y2: _y - settings.ticklen })
		_daCanvas.drawLine({ strokeStyle: settings.color ,
			strokeWidth: 2, rounded: false, 
                        endArrow: true, arrowRadius: 10, arrowAngle: 45, 
                        x1: _XPos(n) + corr, y1: _y - settings.ticklen-5,
			x2: _XPos(s) - corr , y2: _y - settings.ticklen -5 })
		_daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(n), y: _y-settings.ticklen-15,
			fontSize: settings.fontSize,
			fontFamily: settings.fontFamily,
                        text: n }); 
		_daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(n+m/2), y: _y-settings.ticklen-15,
			fontSize: settings.fontSize,
			fontFamily: settings.fontFamily,
                        layer: true,  name: 'myStep', text: step});
		_daCanvas.drawText({ strokeStyle: settings.color,
			fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(s), y: _y-settings.ticklen-15,
			fontSize: settings.fontSize,
			fontFamily: settings.fontFamily,
                        text: s }); 
    		_daCanvas.drawRect({  strokeStyle: settings.color,
		    	x: _XPos(n+m/2), y: _y-settings.ticklen-15, 
			width: _daCanvas.measureText('myStep').width+6,  
			height: _daCanvas.measureText('myStep').height+6  });
        } // drawSum

        /** Draw the number line on the canvas set by
         * @see setCanvas.
	 * This function should be used to to plot the line itself.
         * @param { options } options - LNum {@link options}
        */
        this.display = function(options){
                // handle defaults
                var settings = $.extend( {}, _defaults, { clear:true, line: true }, options );

                setScale( settings );
                if (settings.clear) {
                    _daCanvas.clearCanvas();
                    _count = 0;
                }
                if (settings.line) numberline(settings);
        };

        // return a brandnew LNum :-)
        return this;

};
