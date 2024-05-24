/* eslint no-console:0 consistent-return:0 */
"use strict";

var animationOn = true;
var isLines = false;
var translations = [0,0];
var width = 100;
var height = 50;
var color = [Math.random(), Math.random(), Math.random(), 1];
var yvel = 0;
var xvel = 1.5;

function changeState() {
  if (animationOn) {
    animationOn = false;
  } else {
    animationOn = true;
    main();
  }
}

function changeLines() {
  if (isLines) {
    isLines = false;
  } else {
    isLines = true;
  }
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  // console.log("mjsdflasdf");
  // Get A WebGL context
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // Get the strings for our GLSL shaders
  var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Link the two shaders into a program
  var program = createProgram(gl, vertexShader, fragmentShader);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");


  // Create a buffer and put three 2d clip space points in it
  var positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  

  drawhere();

  // code above this line is initialization code.
  // code below this line is rendering code.

  // webglUtils.resizeCanvasToDisplaySize(gl.canvas);


   function drawhere() {
     // Tell WebGL how to convert from clip space to pixels
     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

     // Clear the canvas
     gl.clearColor(0, 0, 0, 1);
     gl.clear(gl.COLOR_BUFFER_BIT);

     // Tell it to use our program (pair of shaders)
     gl.useProgram(program);

     // Turn on the attribute
     gl.enableVertexAttribArray(positionAttributeLocation);

     // Bind the position buffer.
     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

     var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

     gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

     // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
     var size = 2;          // 2 components per iteration
     var type = gl.FLOAT;   // the data is 32bit floats
     var normalize = false; // don't normalize the data
     var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
     var offset = 0;        // start at the beginning of the buffer
     gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

    if (!isLines) {
      setRectangle(gl, translations[0], translations[1], width, height);
    } else {
      setLinesRect(gl, translations[0], translations[1], width, height);
    }
     gl.uniform4fv(colorUniformLocation, color);

     // draw
    var primitiveType;
     if (!isLines) {
      primitiveType = gl.TRIANGLES;
     } else {
      primitiveType = gl.LINES;
     }
     var offset = 0;
     var count = (isLines ? 12 : 6);
     gl.drawArrays(primitiveType, offset, count);

     if (animationOn) {
      update();

      requestAnimationFrame(drawhere);
     }
   } 

   function update() {
      var i = 0;
      if ( translations[1] + height < 500) {
        yvel += 0.1;
        translations[1] += yvel;
      } else {
        yvel *= -1
        translations[1] = 500-height-1;
      }

      if (translations[0] > 0 && xvel < 0) {
        translations[0] += xvel;
      } else if (translations[0] < 500 - width && xvel > 0) {
        translations[0] += xvel;
      } else {
        xvel *= -1;
      }
   }

  // console.log("MJKE");
}

function randomInt(range) {
  return Math.floor(Math.random() * range);
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1,y1,
    x2,y1,
    x1,y2,
    x1,y2,
    x2,y1,
    x2,y2
  ]), gl.STATIC_DRAW);
}

function setLinesRect(gl, x, y, width, height) {
  var x2 = x + width;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x,y,
    x2,y,
    x2,y,
    x2,y2,
    x2,y2,
    x,y,
    x,y,
    x,y2,
    x,y2,
    x2,y2,
    x2,y2,
    x,y,
  ]), gl.STATIC_DRAW);
}

main();
