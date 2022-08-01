[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

# LNum.js

LNum.js is a simple javascript object to display whole or
rational numbers on a number line. The line is drawn
on a html5 canvas element to give a graphic representation
of numbers and simple sums. The image can be retrieved as a string containing a
base64-encoded image URL (gif, jpeg or png).

LNum.js depends on nothing but your daily dose of vanilla javascript - I
created the class because I often need a simple and fast way
to create a dynamic representation of integers and rational
numbers for a basic maths lecture.

Here's a [demo page](https://marcusoettinger.github.io/LNum.js "Demo page").

LNum.js is written in pure javascript w/o any dependencies
on external libs.

Usage is pretty simple: line = new LNum( start, end, canvas ) creates a new LNum object
on canvas, line.display() draws the number line on the canvas. Numbers can be
added by line.drawN() or line.drawQ().

For further information see the LNum.js [documentation](doc/index.html).

## Installation

Clone the repository or get a package and include the file LNum.js or
LNum.min.js (well, use a browser supporting the html canvas). That's it.

## Licensing

This project is licensed under the terms of the 
[MIT license](LICENSE.md).

