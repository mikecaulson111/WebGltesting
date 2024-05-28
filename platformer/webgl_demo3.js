/* eslint no-console:0 consistent-return:0 */
"use strict";

var animationOn = true;
var isLines = false;
var translations = [0, 0];
var width = 100;
var height = 50;
var color = [Math.random(), Math.random(), Math.random(), 1];
var yvel = 0;
var xvel = 1.5;
var num_below_num = 0;
var onFloor = false;
var hello;
var xposVel = false;
var xnegVel = false;
var prevy = 0;

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

function jump() {
  yvel = -30;
  onFloor = false;
  num_below_num = 0;
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

  // ## Keyboard detection start:
  const bodyElement = document.querySelector("body");

  bodyElement.addEventListener("keydown", KeyDown, false);
  bodyElement.addEventListener("keyup", KeyUp, false);

  function KeyDown( event ) {
    // console.log(event);
    switch (event.key) {
      case ' ':
        yvel = -14;
        onFloor = false;
        break;
      case 'a':
      case 'A':
        xnegVel = true;
        break;
      case 'd':
      case 'D':
        xposVel = true;
        break;
    }
  }

  function KeyUp( event ) {
    // console.log(event);
    switch (event.key) {
      case 'a':
      case 'A':
        xnegVel = false;
        break;
      case 'd':
      case 'D':
        xposVel = false;
        break;
      case 'l':
      case 'L':
        isLines = !isLines;
        break;
    }
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

  var square_arrays = [
    200, 100, 200, 50,
    400, 300, 75, 25,
  ];
  var colors = [
    [Math.random(), Math.random(), Math.random(), 1],
    [Math.random(), Math.random(), Math.random(), 1],
  ];
  var number_arrays = 2;
  var collide = false;



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

    var offset = 0;
    var count = (isLines ? 12 : 6);
    // draw
    var primitiveType;
    if (!isLines) {
      primitiveType = gl.TRIANGLES;
    } else {
      primitiveType = gl.LINES;
    }
    
    for (var j = 0; j < number_arrays; j++) {
      gl.uniform4fv(colorUniformLocation, colors[j]);
      if (!isLines) {
        setRectangle(gl, square_arrays[j*4], square_arrays[j*4 + 1], square_arrays[j*4 + 2], square_arrays[j*4 + 3]);
      } else {
        setLinesRect(gl, square_arrays[j*4], square_arrays[j*4 + 1], square_arrays[j*4 + 2], square_arrays[j*4 + 3]);
      }
      gl.drawArrays(primitiveType, offset, count);
    }

    if (!isLines) {
      setRectangle(gl, translations[0], translations[1], width, height);
    } else {
      setLinesRect(gl, translations[0], translations[1], width, height);
    }
    gl.uniform4fv(colorUniformLocation, color);

    
    
    gl.drawArrays(primitiveType, offset, count);

    

    if (animationOn) {
      update();

      requestAnimationFrame(drawhere);
    }
  }

  function update() {
    var i = 0;

    if (xnegVel) {
      xvel = -10;
    }
    if (xposVel) {
      xvel = 10;
    }

    var nextLowest = 500;
    for (var j = 0; j < number_arrays; j++) {
      var tx = Math.abs((square_arrays[j*4] + (square_arrays[j*4 + 2] / 2)) - (translations[0] + width/2))
      var ty = Math.abs((square_arrays[j*4 + 1] + (square_arrays[j*4+3] / 2)) - (translations[1] + height/2));
      var tx1 = square_arrays[j*4 + 2] / 2 + width / 2;
      var ty1 = square_arrays[j*4 + 3] / 2 + height / 2;

      if (tx < tx1 && ty < ty1 && prevy + height < square_arrays[j*4+1]) {
        console.log("COLID__ ", j);
        nextLowest = square_arrays[j*4+1] - 1;
        collide = true;
      } else {
        // if (collide && tx > tx1) {
        //   onFloor = false;
        //   nextLowest = 500;
        //   collide = false;
        //   // console.error("NO LONGER COLLIDING");
        // }
        if (collide && (translations[0] + width < square_arrays[j*4] || translations[0] > square_arrays[j*4] + square_arrays[j*4 + 2] )) {
          onFloor = false;
          nextLowest = 500;
          collide = false;
          // console.error("NO LONGER COLLIDING");
        }
      }
    }

    prevy = translations[1];

    if (!onFloor) {
      if (translations[1] + height < nextLowest + 1) {
        yvel += 0.5;
        yvel *= 0.996;
        translations[1] += yvel;
      } else {
        yvel = 0;
        translations[1] = nextLowest - height;
        onFloor = true;
      }
    }

    if (translations[0] > 0 && xvel < 0) {
      translations[0] += xvel;
    } else if (translations[0] < 500 - width && xvel > 0) {
      translations[0] += xvel;
    }
    if (Math.abs(xvel) > 0.001) {
      xvel *= 0.85;
    } else {
      xvel = 0;
    }

    if (!onFloor) {
      if (Math.abs(yvel) < 3.5) {
        num_below_num += 1;
      } else {
        num_below_num = 0;
      }
    }

    if (num_below_num > 50) {
      yvel = 0;
      translations[1] = 500 - height;
      onFloor = true;
    }

    num_below_num %= 100;
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
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ]), gl.STATIC_DRAW);
}

function setLinesRect(gl, x, y, width, height) {
  var x2 = x + width;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x, y,
    x2, y,
    x2, y,
    x2, y2,
    x2, y2,
    x, y,
    x, y,
    x, y2,
    x, y2,
    x2, y2,
    x2, y2,
    x, y,
  ]), gl.STATIC_DRAW);
}

main();
