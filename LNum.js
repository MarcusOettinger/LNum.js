// M. Oettinger 05/2015, Marcus -at- oettinger-physics.de
//
/** 
 * @file LNum.js: sketch integers on a number line in a html5 canvas
 * @author Marcus Oettinger
 * @version 0.1
 * @overview  LNum.js is a javascript class used to display a simple number line
 * (displaying natural numbers, integers or rational numbers) on a html5-canvas and
 * show a quite limited set of basic calculations with integers.
 */
/**
 * @license MIT (see {@link http://opensource.org/licenses/MIT} or LICENSE.txt).
 */
/**
 * @classdesc
 * LNum is a javascript object plotting integers on a number line.
 * Graphics are drawn onto a html5 canvas - this should nowadays be supported 
 * by most browsers.
 *
 * I wrote the code because I needed a dynamic way to Show natural numbers and
 * integers in html pages for a a basic maths lecture. It serves a purpose and is far from
 * being cleanly written, nicely formatted or similar. If you like it, use it, If you don't
 * - guess what :-)
 * 
 * @class LNum.js
 * Number line showing the interval [a, b].
 * usage: object = new LNum( a, b ) creates a new number line, e.g.
 *        myLine = new LNum( -10, 10 );
 * 
 * LNum.js uses some external libraries:
 *
 * - jquery: {@link http://jquery.org}
 * - jcanvas: {@link http://calebevans.me/projects/jcanvas/} (drawing routines)
 * @constructor
 * @param {integer} a: start of the number line (left side)
 * @param {integer} b: end of the number line (right side)
 * @param {canvas} cnv: optional canvas elementto plot on
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

        // default options - values are settable for every number displayed
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
            		color: "#888", 		// color to use for displaying an integer (in [a,b]) if line is false,
                                                                                     // rsp. color of the whole line (if line is true)
        };


        // handle interval:
        a == b? b=a+10:b;	// paranoia mode!
        _left = min(a,b);		// catch direction problems
        _right = max(a,b);

        // calculate coordinates of an integer on the canvas
        function _XScaled(x) { return _SCALE * x; };
        function _XPos(x) { return _offset + _XScaled(x); };
        function _YPos(y) { return _y };

        // return the sign of a number x (this ought to be fast and safe)
        function sign(x) { return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN; }

        // return minimum in the sense of: b if b<a, a otherwise.
        function min(a,b){ if (b<a){ return b; } return a; };

        // return maximum in the sense of: b if b>a, a otherwise.
        function max(a,b){ if (b>a){ return b; } return a; };

        // SetScale: calculate a reasonable scale to plot a number line
        // from a to b on the canvas 
        function setScale( settings ) {
                    _len = _right - _left;
                    _SCALE = (_daCanvas.width() - 2 * _margin) / _len;
                    _offset = _margin - (_SCALE * min(a,b));       // Position of Zero
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


        // drawticks(pos): draw ticks on the number line at n = pos
        // (internal function used by axis())
        //
        function drawticks(pos, settings) {
                _daCanvas.drawLine({ strokeStyle: settings.color, strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , y1: _y, x2: _XPos(pos), y2: _y + _tickLength })
                _daCanvas.drawText({ strokeStyle: settings.color, strokeWidth: 1,
                        x: _XPos(pos), y: _y+10, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        text: pos });
        }; // drawticks


        // draw the number line onto _daCanvas
        //
        function numberline(options){
               if (_daCanvas == null) return;
                var settings = $.extend( {}, _defaults, options );

               _daCanvas.drawLine({ strokeStyle: settings.color, strokeWidth: 2, rounded: false,
                       endArrow: false, x1: _margin, y1: _y, x2: _margin + _len * _SCALE , y2: _y });
                for ( i=_left; i<=_right; i+=_TICKSCALE) {
                    drawticks(i, settings);
                }
        }; // axis

        // =======================================================
        // Public:
        // =======================================================

        /**
        /* @method setCanvas ( cnv )
         * @param {integer} cnv the canvas to use
         */
        this.setCanvas = function( cnv ) {  _daCanvas = cnv; };
        /**
        /* @method getCanvasImage ( type )
         * @param { string } type type of image
         * @returns { string } a base64-encoded image
         */
        this.getCanvasImage = function( type ) { return _daCanvas.getCanvasImage( type ); }


        // drawQ(n, settings): draw a rational number q=(z/n) on the number line at q = z/n
        //
        //
        this.drawQ = function ( z, n , options) {
                var settings = $.extend( {}, _defaults, options );
                pos = z/n;

                _daCanvas.drawLine({ strokeStyle: settings.color , strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , y1: _y, x2: _XPos(pos), y2: _y - settings.ticklen });

                _daCanvas.drawText({ strokeStyle: settings.color, fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(pos), y: _y-settings.ticklen-10, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        text: pos });
        }; // drawticks



        // drawN(n, settings): draw an integer on the number line at n = pos
        //
        //
        this.drawN = function ( pos , options) {
                var settings = $.extend( {}, _defaults, options );

                _daCanvas.drawLine({ strokeStyle: settings.color , strokeWidth: 2, rounded: false,
                        endArrow: false, x1: _XPos(pos) , y1: _y, x2: _XPos(pos), y2: _y - settings.ticklen })
                _daCanvas.drawText({ strokeStyle: settings.color, fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(pos), y: _y-settings.ticklen-10, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        text: pos });
        }; // drawN


        //
        //
        this.drawSum = function( n, m, options ) {
            var s = n + m;
            if (m>0) 
                step = "+" + m;
            else
                step = m;
            var settings = $.extend(  _defaults, { ticklen: 35 },  options );
            _daCanvas.drawLine({ strokeStyle: settings.color , strokeWidth: 1, rounded: false,
                        endArrow: false, x1: _XPos(n) , y1: _y, x2: _XPos(n), y2: _y - settings.ticklen })
            _daCanvas.drawLine({ strokeStyle: settings.color , strokeWidth: 1, rounded: false,
                        endArrow: false, x1: _XPos(s) , y1: _y, x2: _XPos(s), y2: _y - settings.ticklen })
            _daCanvas.drawLine({ strokeStyle: settings.color , strokeWidth: 2, rounded: false, 
                        endArrow: true, arrowRadius: 10, arrowAngle: 45, 
                        x1: _XPos(n), y1: _y - settings.ticklen-5, x2: _XPos(s) , y2: _y - settings.ticklen -5 })
            _daCanvas.drawText({ strokeStyle: settings.color, fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(n), y: _y-settings.ticklen-15, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        text: n }); 
            _daCanvas.drawText({ strokeStyle: settings.color, fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(n+m/2), y: _y-settings.ticklen-15, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        layer: true,  name: 'myStep', text: step});
            _daCanvas.drawText({ strokeStyle: settings.color, fillStyle: settings.color, strokeWidth: 1,
                        x: _XPos(s), y: _y-settings.ticklen-15, fontSize: settings.fontSize, fontFamily: settings.fontFamily,
                        text: s }); 
            _daCanvas.drawRect({  strokeStyle: settings.color, x: _XPos(n+m/2), y: _y-settings.ticklen-15, 
                       width: _daCanvas.measureText('myStep').width+6,  
                       height: _daCanvas.measureText('myStep').height+6  });


        }

        // * clear canvas and draw 
        // 
        /** Draw the number line on the canvas set by
         *@see setCanvas. This function should be used to to plot the line itself.
         *
         * @see addToPlot
         * @param {boolean} clear - Clear canvas before displaying complex number if set (default: true)
         * @param {boolean} coords - Draw a cartesian coordinate system if set (default: true)
         * @param {boolean} circle - Draw a circle with radius |z| (this is poor man's rotating pointer, default: true)
         * @param {boolean} ReIm - Show real and imaginary parts by thin vertical/horizontal lines in color (see below, default: true)
        * @param {boolean} color - a color in html notation (default "#888")
        * @param {boolean} colarrow - draw arrow in color if set (default: black arrow)
        * @param {optional number} radius scale the plot for a complex number of this value (default: autoscale)
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

}; // -- LNum --
