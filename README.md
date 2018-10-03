# LNum.js

LNum.js is a simple javascript object to display numbers on
a number line. The line is drawn as a gif, jpeg or png image
on a html5 canvas element to show the numbers and simple
sums. The image can be retrieved as a string containing a
base64-encoded image URL.

I created the class because I needed a simple and fast way
to create dynamic representation of integers for a basic
maths lecture.

Here's a [demo page](https://marcusoettinger.github.io/LNum.js "Demo page").

LNum.js uses some external libraries:
  * [jquery](http://jquery.org)
  * [jcanvas](http://calebevans.me/projects/jcanvas/) (drawing routines)

Usage is simple: line = new LNum( start, end, canvas ) creates a new LNum object
on canvas, line.display() draws the number line on the canvas. Numbers can be
added by line.drawN() or line.drawQ().

For further information see the LNum.js [doc/index.html](documentation).

## Installation

Clone the repository or get a package and include the file LNum.js after
jquery. That's it.

## Licensing

This project is licensed under the terms of the 
[LICENSE.md](MIT license).


