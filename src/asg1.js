/*
Mariah Balandran
mbalandr@ucsc.edu

Notes to Grader:
Closely followed video tutorial playlist provided at the top of the assignment, then used ChatGPT for help with the Cat drawing function to learn how the provided functions are used outside of a mouse click event. The Vampire drawing (code and reference drawing) was completely made by me.
*/


// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Global Variables
var canvas;
var gl;
var a_Position;
var u_FragColor;
var u_Size;

function main() {
    // Canvas and GL vars
    getWebGL();

    // Init GLSL shader programs and connect GLSL vars
    connectGLSL();

    //Set initial img value
    document.getElementById('ref-img').style.display = 'none';

    // Actions for HTML UI
    htmlActions();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    // Register function (event handler) to be called on a mouse move
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Enable alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Learned about alpha blending from ChatGPT when debugging my implementation

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
var printPos = [0, 0];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) {
    
    // Click event to WebGL coords
    var [x, y] = eventToGL(ev);

    // Create and store the new point
    var point;
    if (g_selectedType === POINT) {
        point = new Point();
    } else if (g_selectedType === TRIANGLE) {
        point = new Triangle();
    } else if (g_selectedType === CIRCLE) {
        point = new Circle();
    } else {
        point = new Quad();
    }

    point.position = [x, y];

    printPos = point.position;

    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    point.segments = g_selectedSeg;
    g_shapesList.push(point);

    // // Store the coordinates to g_points array
    // g_points.push([x, y]);

    // // Store the color
    // // g_colors.push(g_selectedColor);
    // g_colors.push(g_selectedColor.slice());

    // // Store the size
    // g_sizes.push(g_selectedSize);

    // Store the coordinates to g_points array
    // if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //     g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    // } else if (x < 0.0 && y < 0.0) { // Third quadrant
    //     g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    // } else {                         // Others
    //     g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    // }

    // Draw every shape
    renderShapes();
}

function getWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true } );
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

function eventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderShapes() {
    // Check start time of function
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // var len = g_points.length;
    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    var duration = performance.now() - startTime;
    setText("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + (Math.floor(10000/duration))/10 + " pos: " + printPos, "numdot");
}

// Set text of HTML element
function setText(text, htmlID) {
    var hElem = document.getElementById(htmlID);

    if (!hElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    hElem.innerHTML = text;
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// UI Globals
var g_selectedColor = [1.0, 1.0, 1.0, 1.0];
var g_selectedSize = 5;
var g_selectedType = POINT;
var g_selectedSeg = 10;

function htmlActions() {
    //Button Events (Shape Color)
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick   = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };

    //Button Events (Clear canvas)
    document.getElementById('clear').onclick = function() { g_shapesList = []; renderShapes();};

    //Button Events (Shape Type)
    document.getElementById('pt').onclick = function() { g_selectedType = POINT };
    document.getElementById('tri').onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById('cl').onclick = function() { g_selectedType = CIRCLE };

    //Slider Events (Shape Color)
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    //Slider Events (Shape Opacity)
    document.getElementById('opSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });

    //Slider Events (Shape Size)
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

    //Slider Events (Circle Segments)
    document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

    //Button Event (Welcome Popup)
    document.getElementById('popup').onclick = function() { popup.style.display = 'none'; };

    //Button Event (Reference and Draw Vamp with WIP colors)
    document.getElementById('ref').onclick = function() {
        var img = document.getElementById('ref-img');
        if (img.style.display === 'none') {
            img.style.display = 'block';
            wipDrawing();
        } else {
            img.style.display = 'none';
        }
    };

    //Button Event (Draw Cat)
    document.getElementById('drawCat').onclick = function() {
        // Main face
        const face = new Circle();
        face.position = [0, 0];
        face.color = [0.655, 0.0, 0.0, 1.0];
        face.size = 70;
        face.segments = 32;
        g_shapesList.push(face);
        
        // Left ear
        const leftEar = new Circle();
        leftEar.position = [-0.25, 0.3];
        leftEar.color = [0.655, 0.0, 0.0, 1.0];
        leftEar.size = 30;
        leftEar.segments = 3;
        leftEar.rotation = 126;
        g_shapesList.push(leftEar);
        
        // Right ear
        const rightEar = new Circle();
        rightEar.position = [0.25, 0.3];
        rightEar.color = [0.655, 0.0, 0.0, 1.0];
        rightEar.size = 30;
        rightEar.segments = 3;
        rightEar.rotation = 53;
        g_shapesList.push(rightEar);
        
        // Left eye
        const leftEye = new Circle();
        leftEye.position = [-0.13, 0.05];
        leftEye.color = [0.0, 0.0, 0.0, 1.0];
        leftEye.size = 16;
        leftEye.segments = 24;
        g_shapesList.push(leftEye);
        
        // Right eye
        const rightEye = new Circle();
        rightEye.position = [0.13, 0.05];
        rightEye.color = [0.0, 0.0, 0.0, 1.0];
        rightEye.size = 16;
        rightEye.segments = 24;
        g_shapesList.push(rightEye);
        
        // Nose
        const nose = new Circle();
        nose.position = [0, -0.07];
        nose.color = [1.0, 0.0, 0.0, 1.0];
        nose.size = 12;
        nose.segments = 3;
        nose.rotation = 30;
        g_shapesList.push(nose);
        
        // Left inner ear
        const leftInnerEar = new Circle();
        leftInnerEar.position = [-0.25, 0.3];
        leftInnerEar.color = [1.0, 0.0, 0.0, 1.0];
        leftInnerEar.size = 16;
        leftInnerEar.segments = 3;
        leftInnerEar.rotation = 126;
        g_shapesList.push(leftInnerEar);
        
        // Right inner ear
        const rightInnerEar = new Circle();
        rightInnerEar.position = [0.25, 0.3];
        rightInnerEar.color = [1.0, 0.0, 0.0, 1.0];
        rightInnerEar.size = 16;
        rightInnerEar.segments = 3;
        rightInnerEar.rotation = 53;
        g_shapesList.push(rightInnerEar);
        
        // Left eye shine
        const leftEyeShine = new Circle();
        leftEyeShine.position = [-0.09, 0.07];
        leftEyeShine.color = [1.0, 1.0, 1.0, 1.0];
        leftEyeShine.size = 6;
        leftEyeShine.segments = 16;
        g_shapesList.push(leftEyeShine);
        
        // Right eye shine
        const rightEyeShine = new Circle();
        rightEyeShine.position = [0.17, 0.07];
        rightEyeShine.color = [1.0, 1.0, 1.0, 1.0];
        rightEyeShine.size = 6;
        rightEyeShine.segments = 16;
        g_shapesList.push(rightEyeShine);
        
        // Render all shapes
        renderShapes();
    };


    //Button Event (Draw Vamp with proper colors)
    document.getElementById('drawVamp').onclick = function() {
        //Back of the hair
        const backOfHair = new Quad();
        backOfHair.verts = [-0.38, 0.65,/*Top-left*/ -0.38, -0.25,/*Bottom-left*/ 0.21, 0.65,/*Top-right*/ 0.21, -0.25/*Bottom-right*/];
        backOfHair.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(backOfHair);

        

        // Scalp/Top of hair
        const scalp1 = new Circle();
        scalp1.position = [-0.11, 0.625];
        scalp1.color = [0.655, 0.0, 0.0, 1.0];
        scalp1.size = 55;
        scalp1.segments = 30;
        g_shapesList.push(scalp1);

        const scalp2 = new Circle();
        scalp2.position = [0.09, 0.65];
        scalp2.color = [0.655, 0.0, 0.0, 1.0];
        scalp2.size = 25;
        scalp2.segments = 30;
        g_shapesList.push(scalp2);

        
        
        // Neck
        const neck = new Quad();
        neck.verts = [-0.185, 0.35,/*Top-left*/ -0.1, -0.0,/*Bottom-left*/ -0.06, 0.35,/*Top-right*/ 0.02, -0.0/*Bottom-right*/];
        neck.color = [0.85, 0.0, 0.0, 1.0];
        g_shapesList.push(neck);

        

        //Sleeves
        const sleeveR = new Quad();
        sleeveR.verts = [-0.465, 0.04,/*Top-left*/ -0.465, -1.0,/*Bottom-left*/ -0.25, 0.04,/*Top-right*/ -0.25, -1.0/*Bottom-right*/];
        sleeveR.color = [0.075, 0.075, 0.075, 1.0];
        g_shapesList.push(sleeveR);

        const sleeveL = new Quad();
        sleeveL.verts = [0.05, 0.04,/*Top-left*/ 0.05, -1.0,/*Bottom-left*/ 0.25, 0.15,/*Top-right*/ 0.25, -1.0/*Bottom-right*/];
        sleeveL.color = [0.075, 0.075, 0.075, 1.0];
        g_shapesList.push(sleeveL);

        const flowR = new Quad();
        flowR.verts = [-0.465, -0.3,/*Top-left*/ -0.76, -1.0,/*Bottom-left*/ -0.465, -0.3,/*Top-right*/ -0.465, -1.0/*Bottom-right*/];
        flowR.color = [0.075, 0.075, 0.075, 1.0];
        g_shapesList.push(flowR);

        const flowL = new Quad();
        flowL.verts = [0.25, -0.25,/*Top-left*/ 0.25, -1.0,/*Bottom-left*/ 0.25, -0.25,/*Top-right*/ 0.585, -1.0/*Bottom-right*/];
        flowL.color = [0.075, 0.075, 0.075, 1.0];
        g_shapesList.push(flowL);

        const shoulderR = new Circle();
        shoulderR.position = [-0.385, 0.07];
        shoulderR.color = [0.075, 0.075, 0.075, 1.0];
        shoulderR.size = 16;
        shoulderR.segments = 30;
        g_shapesList.push(shoulderR);

        const shoulderL = new Circle();
        shoulderL.position = [0.185, 0.145];
        shoulderL.color = [0.075, 0.075, 0.075, 1.0];
        shoulderL.size = 14;
        shoulderL.segments = 30;
        g_shapesList.push(shoulderL);



        // Body
        const abs = new Quad();
        abs.verts = [-0.285, -0.15,/*Top-left*/ -0.12, -0.6,/*Bottom-left*/ 0.2, -0.17,/*Top-right*/ 0.05, -0.6/*Bottom-right*/];
        abs.color = [0.115, 0.115, 0.115, 1.0];
        g_shapesList.push(abs);

        const stomach = new Quad();
        stomach.verts = [0.065, -0.3,/*Top-left*/ -0.4, -0.655,/*Bottom-left*/ 0.065, -0.3,/*Top-right*/ 0.265, -0.655/*Bottom-right*/];
        stomach.color = [0.115, 0.115, 0.115, 1.0];
        g_shapesList.push(stomach);

        const hips = new Quad();
        hips.verts = [-0.4, -0.655,/*Top-left*/ -0.35, -1.0,/*Bottom-left*/ 0.265, -0.655,/*Top-right*/ 0.2, -1.0/*Bottom-right*/];
        hips.color = [0.115, 0.115, 0.115, 1.0];
        g_shapesList.push(hips);


        
        // Chest
        const collarR = new Quad();
        collarR.verts = [-0.37, 0.15,/*Top-left*/ -0.27, -0.1,/*Bottom-left*/ -0.225, 0.115,/*Top-right*/ -0.2, -0.1/*Bottom-right*/];
        collarR.color = [0.115, 0.115, 0.115, 1.0];
        g_shapesList.push(collarR);

        const collarL = new Quad();
        collarL.verts = [0.05, 0.13,/*Top-left*/ 0.05, -0.1,/*Bottom-left*/ 0.17, 0.214,/*Top-right*/ 0.17, -0.1/*Bottom-right*/];
        collarL.color = [0.115, 0.115, 0.115, 1.0];
        g_shapesList.push(collarL);

        const upperChest = new Quad();
        upperChest.verts = [-0.225, 0.115,/*Top-left*/ -0.22, 0.014,/*Bottom-left*/ 0.075, 0.145,/*Top-right*/ 0.1, 0.0645,/*Bottom-right*/];
        upperChest.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(upperChest);

        const bR = new Circle();
        bR.position = [-0.17, -0.155];
        bR.color = [0.115, 0.115, 0.115, 1.0];
        bR.size = 31;
        bR.segments = 30;
        g_shapesList.push(bR);

        const bL = new Circle();
        bL.position = [0.085, -0.115];
        bL.color = [0.115, 0.115, 0.115, 1.0];
        bL.size = 31;
        bL.segments = 30;
        g_shapesList.push(bL);

        const chest = new Quad();
        chest.verts = [-0.22, 0.024,/*Top-left*/ -0.2, -0.16,/*Bottom-left*/ 0.1, 0.0645,/*Top-right*/ 0.15, -0.115/*Bottom-right*/];
        chest.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(chest);


        //Wings
        const wingR = new Quad();
        wingR.n = 4;
        wingR.verts = [0.35, 0.9,/*Top-left*/ 0.2, 0.825,/*Bottom-left*/ 0.425, 0.8,/*Top-right*/ 0.3, 0.775,/*Bottom-right*/];
        wingR.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(wingR);
        
        const wingRa = new Circle();
        wingRa.position = [0.245, 0.76];
        wingRa.color = [0.0, 0.0, 0.0, 1.0];
        wingRa.size = 14;
        wingRa.segments = 30;
        g_shapesList.push(wingRa);

        const wingRb = new Circle();
        wingRb.position = [0.37, 0.745];
        wingRb.color = [0.0, 0.0, 0.0, 1.0];
        wingRb.size = 14;
        wingRb.segments = 30;
        g_shapesList.push(wingRb);

        const wingL = new Quad();
        wingL.n = 4;
        wingL.verts = [-0.55, 0.9,/*Top-left*/ -0.4, 0.825,/*Bottom-left*/ -0.625, 0.8,/*Top-right*/ -0.5, 0.775,/*Bottom-right*/];
        wingL.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(wingL);
        
        const wingLa = new Circle();
        wingLa.position = [-0.445, 0.76];
        wingLa.color = [0.0, 0.0, 0.0, 1.0];
        wingLa.size = 14;
        wingLa.segments = 30;
        g_shapesList.push(wingLa);

        const wingLb = new Circle();
        wingLb.position = [-0.57, 0.745];
        wingLb.color = [0.0, 0.0, 0.0, 1.0];
        wingLb.size = 14;
        wingLb.segments = 30;
        g_shapesList.push(wingLb);



        //Head
        const earR = new Quad();
        earR.verts = [-0.44, 0.57,/*Top-left*/ -0.25, 0.315,/*Bottom-left*/ -0.44, 0.57,/*Top-right*/ -0.25, 0.485/*Bottom-right*/];
        earR.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(earR);

        const earL = new Quad();
        earL.verts = [0.235, 0.525,/*Top-left*/ 0.081, 0.45,/*Bottom-left*/ 0.235, 0.525,/*Top-right*/ 0.081, 0.325/*Bottom-right*/];
        earL.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(earL);

        const chin = new Quad();
        chin.verts = [-0.3, 0.33,/*Top-left*/ -0.1, 0.215,/*Bottom-left*/ -0.3, 0.33,/*Top-right*/ 0.1, 0.3/*Bottom-right*/];
        chin.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(chin);

        const cranium = new Quad();
        cranium.verts = [-0.33, 0.75,/*Top-left*/ -0.3, 0.33,/*Bottom-left*/ 0.15, 0.685,/*Top-right*/ 0.1, 0.3/*Bottom-right*/];
        cranium.color = [1.0, 0.0, 0.0, 1.0];
        g_shapesList.push(cranium);



        //Hair
        const sideR = new Quad();
        sideR.n = 3;
        sideR.verts = [-0.365, 0.275,/*Top-left*/ -0.25, 0.13,/*Bottom*/ -0.3, 0.65,/*Top-right*/];
        sideR.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(sideR);

        const sideL = new Quad();
        sideL.n = 3;
        sideL.verts = [0.175, 0.3,/*Top-left*/ 0.09, 0.13,/*Bottom*/ 0.14, 0.65,/*Top-right*/];
        sideL.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(sideL);

        const front1 = new Quad();
        front1.n = 4;
        front1.verts = [-0.345, 0.755,/*Top-left*/ -0.33, 0.55,/*Bottom-right*/ 0.05, 0.83,/*Top-right*/ -0.08, 0.65,/*Bottom-left*/];
        front1.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(front1);

        const front2 = new Quad();
        front2.n = 4;
        front2.verts = [-0.05, 0.8,/*Top-left*/ -0.045, 0.61,/*Bottom-right*/ 0.09, 0.79,/*Top-right*/ 0.055, 0.68,/*Bottom-left*/];
        front2.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(front2);

        const front3 = new Quad();
        front3.n = 4;
        front3.verts = [0.09, 0.79,/*Top-left*/ 0.07, 0.575,/*Bottom-right*/ 0.14, 0.734,/*Top-right*/ 0.135, 0.675,/*Bottom-left*/];
        front3.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(front3);

        const bang1 = new Quad();
        bang1.n = 4;
        bang1.verts = [-0.16, 0.83,/*Top-left*/ -0.355, 0.5,/*Bottom-right*/ -0.2, 0.605,/*Top-right*/ -0.34, 0.5,/*Bottom-left*/];
        bang1.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(bang1);

        const bang2 = new Quad();
        bang2.n = 4;
        bang2.verts = [0.05, 0.83,/*Top-left*/ -0.27, 0.5,/*Bottom-right*/ -0.045, 0.61,/*Top-right*/ -0.26, 0.5,/*Bottom-left*/];
        bang2.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(bang2);

        const bang3 = new Quad();
        bang3.n = 4;
        bang3.verts = [0.09, 0.79,/*Top-left*/ -0.0435, 0.475,/*Bottom-right*/ 0.07, 0.575,/*Top-right*/ -0.0385, 0.475,/*Bottom-left*/];
        bang3.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(bang3);

        const bang4 = new Quad();
        bang4.n = 4;
        bang4.verts = [0.125, 0.75,/*Top-left*/ 0.155, 0.48,/*Bottom-right*/ 0.2, 0.61,/*Top-right*/ 0.165, 0.48,/*Bottom-left*/];
        bang4.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(bang4);



        //Face

        //Eyelids
        const lidR = new Quad();
        lidR.n = 6;
        lidR.verts = [-0.1, 0.56,/*Top-left*/ -0.115, 0.5595,/*Top-left-under*/ -0.16, 0.59,/*ml*/ -0.16, 0.5875,/*ml-under*/ -0.23, 0.585,/*tp*/ -0.24, 0.575,/*tp-under*/ -0.275, 0.6];
        lidR.color = [0.6, 0.0, 0.0, 1.0];
        g_shapesList.push(lidR);

        const lidL = new Quad();
        lidL.n = 6;
        lidL.verts = [0.01, 0.54,/*Top-left*/ 0.015, 0.535,/*Top-left-under*/ 0.075, 0.55,/*ml*/ 0.075, 0.545,/*ml-under*/ 0.125, 0.53,/*tp*/ 0.115, 0.525,/*tp-under*/ 0.15, 0.5];
        lidL.color = [0.6, 0.0, 0.0, 1.0];
        g_shapesList.push(lidL);

        //Eyebrows
        const browR = new Quad();
        browR.n = 6;
        browR.verts = [-0.08, 0.58,/*Top-left*/ -0.095, 0.5795,/*Top-left-under*/ -0.16, 0.61,/*ml*/ -0.16, 0.605,/*ml-under*/ -0.265, 0.65,/*tp*/ -0.265, 0.64,/*tp-under*/ -0.275, 0.64];
        browR.color = [0.0, 0.0, 0.0, 1.0];
        g_shapesList.push(browR);

        const browL = new Quad();
        browL.n = 6;
        browL.verts = [0.0, 0.565,/*Top-left*/ 0.014, 0.56,/*Top-left-under*/ 0.075, 0.57,/*ml*/ 0.075, 0.565,/*ml-under*/ 0.125, 0.575,/*tp*/ 0.14, 0.565,/*tp-under*/ 0.15, 0.5];
        browL.color = [0.0, 0.0, 0.0, 1.0];
        g_shapesList.push(browL);

        //Eyes
        const eyewR = new Quad();
        eyewR.n = 11;
        eyewR.verts = [-0.245, 0.585,/*tp*/ -0.29, 0.55,/*Top-left*/ -0.265, 0.4725,/*ml*/ -0.21, 0.425,/*Bottom-left*/ -0.18, 0.43,/*bt*/ -0.245, 0.585,/*tp*/ -0.17, 0.5725,/*Top-right*/ -0.265, 0.4725,/*ml*/ -0.1215, 0.5125,/*mt*/ -0.21, 0.425,/*Bottom-left*/ -0.11, 0.425,/*Bottom-right*/ -0.21, 0.425/*Bottom-left*/];
        eyewR.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(eyewR);

        const eyewL = new Quad();
        eyewL.n = 11;
        eyewL.verts = [0.125, 0.53,/*tp*/ 0.155, 0.475,/*Top-left*/ 0.12, 0.415,/*ml*/ 0.062, 0.396,/*Bottom-left*/ 0.01, 0.4175,/*bt*/ 0.125, 0.53,/*tp*/ 0.06, 0.53,/*Top-right*/ 0.12, 0.415,/*ml*/ 0.0135, 0.49,/*mt*/ 0.062, 0.396,/*Bottom-left*/ -0.015, 0.4175,/*Bottom-right*/ 0.062, 0.396/*Bottom-left*/];
        eyewL.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(eyewL);

        const irisR = new Circle();
        irisR.color = [0.655, 0.0, 0.0, 1.0];
        irisR.position = [-0.18, 0.505];
        irisR.size = 12;
        irisR.segments = 30;
        g_shapesList.push(irisR);

        const irisL = new Circle();
        irisL.color = [0.655, 0.0, 0.0, 1.0];
        irisL.position = [0.0645, 0.4725];
        irisL.size = 11;
        irisL.segments = 30;
        g_shapesList.push(irisL);

        const pupilR = new Quad();
        pupilR.color = [0.325, 0.0, 0.0, 1.0];
        pupilR.n = 5;
        pupilR.verts = [-0.18, 0.45,/*Bottom*/ -0.19, 0.5,/*Left*/ -0.18, 0.555,/*Top*/ -0.17, 0.5,/*Right*/ -0.18, 0.45,/*Bottom*/];
        g_shapesList.push(pupilR);

        const pupilL = new Quad();
        pupilL.color = [0.325, 0.0, 0.0, 1.0];
        pupilL.n = 5;
        pupilL.verts = [0.065, 0.42,/*Bottom*/ 0.055, 0.47,/*Left*/ 0.065, 0.525,/*Top*/ 0.075, 0.47,/*Right*/ 0.065, 0.42,/*Bottom*/];
        g_shapesList.push(pupilL);

        const lashL = new Quad();
        lashL.n = 10;
        lashL.verts = [-0.015, 0.4175,/*Bottom-left*/ 0.01, 0.5,/*Top-left*/ 0.02, 0.485,/*Top-left-under*/ 0.05, 0.53,/*ml*/ 0.055, 0.515,/*ml-under*/ 0.125, 0.53,/*tp*/ 0.115, 0.515,/*tp-under*/ 0.16, 0.5,/*lash-point-return*/ 0.155, 0.475,/*Bottom-right*/ 0.2, 0.52,/*lash-point*/ ];
        lashL.color = [0.0, 0.0, 0.0, 1.0];
        g_shapesList.push(lashL);

        const lashR = new Quad();
        lashR.n = 10;
        lashR.verts = [-0.11, 0.425,/*Bottom-left*/ -0.115, 0.52,/*Top-left*/ -0.13, 0.5075,/*Top-left-under*/ -0.16, 0.5725,/*ml*/ -0.17, 0.556,/*ml-under*/ -0.23, 0.585,/*tp*/ -0.24, 0.565,/*tp-under*/ -0.275, 0.576,/*lash-point-return*/ -0.285, 0.545,/*Bottom-right*/ -0.34, 0.6,/*lash-point*/ ];
        lashR.color = [0.0, 0.0, 0.0, 1.0];
        g_shapesList.push(lashR);

        //Nose
        const nose = new Quad();
        nose.n = 3;
        nose.verts = [-0.07, 0.345,/*Bottom-Left*/ -0.05, 0.345,/*Bottom-Right*/ -0.045, 0.36/*Top-Right*/];
        nose.color = [0.6, 0.0, 0.0, 1.0];
        g_shapesList.push(nose);

        //Mouth
        const mouth = new Quad();
        mouth.n = 6;
        mouth.verts = [-0.13, 0.29,/*Top-Left*/ -0.09, 0.315,/*ml*/ -0.08, 0.305,/*ml-under*/ -0.03475, 0.31,/*tp*/ -0.03475, 0.295,/*tp-under*/ -0.035, 0.275/*Top-Right*/ -0.03475, 0.285,/*Top-Right-under*/];
        mouth.color = [0.6, 0.0, 0.0, 1.0];
        g_shapesList.push(mouth);

        //Fang
        const fang = new Quad();
        fang.n = 3;
        fang.verts = [-0.065, 0.305,/*Top-Left*/ -0.06, 0.26,/*bt*/ -0.04, 0.295/*Top-Right*/];
        fang.color = [1.0, 1.0, 1.0, 1.0];
        g_shapesList.push(fang);

        //Blush
        const blush1R = new Quad();
        blush1R.n = 4;
        blush1R.verts = [-0.25, 0.39,/*Top-Left*/ -0.245, 0.385,/*bt*/ -0.24, 0.38,/*Bottom-Right*/ -0.22, 0.415,/*tp*/];
        blush1R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush1R);

        const blush2R = new Quad();
        blush2R.n = 4;
        blush2R.verts = [-0.225, 0.385,/*Top-Left*/ -0.22, 0.38,/*bt*/ -0.215, 0.375,/*Bottom-Right*/ -0.195, 0.41,/*tp*/];
        blush2R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush2R);

        const blush3R = new Quad();
        blush3R.n = 4;
        blush3R.verts = [-0.2, 0.38,/*Top-Left*/ -0.195, 0.375,/*bt*/ -0.19, 0.37,/*Bottom-Right*/ -0.17, 0.405,/*tp*/];
        blush3R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush3R);

        const blush4R = new Quad();
        blush4R.n = 4;
        blush4R.verts = [-0.1, 0.39,/*Top-Left*/ -0.095, 0.385,/*bt*/ -0.09, 0.38,/*Bottom-Right*/ -0.07, 0.415,/*tp*/];
        blush4R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush4R);

        const blush5R = new Quad();
        blush5R.n = 4;
        blush5R.verts = [-0.075, 0.385,/*Top-Left*/ -0.07, 0.38,/*bt*/ -0.065, 0.375,/*Bottom-Right*/ -0.045, 0.41,/*tp*/];
        blush5R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush5R);

        const blush6R = new Quad();
        blush6R.n = 4;
        blush6R.verts = [-0.050, 0.38,/*Top-Left*/ -0.045, 0.375,/*bt*/ -0.04, 0.37,/*Bottom-Right*/ -0.02, 0.405,/*tp*/];
        blush6R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush6R);

        const blush7R = new Quad();
        blush7R.n = 4;
        blush7R.verts = [0.01, 0.36,/*Top-Left*/ 0.015, 0.355,/*bt*/ 0.02, 0.35,/*Bottom-Right*/ 0.04, 0.385,/*tp*/];
        blush7R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush7R);

        const blush8R = new Quad();
        blush8R.n = 4;
        blush8R.verts = [0.035, 0.355,/*Top-Left*/ 0.04, 0.35,/*bt*/ 0.045, 0.345,/*Bottom-Right*/ 0.065, 0.38,/*tp*/];
        blush8R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush8R);

        const blush9R = new Quad();
        blush9R.n = 4;
        blush9R.verts = [0.06, 0.35,/*Top-Left*/ 0.065, 0.345,/*bt*/ 0.07, 0.34,/*Bottom-Right*/ 0.09, 0.375,/*tp*/];
        blush9R.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(blush9R);



        //Droplets
        const drop1b = new Quad();
        drop1b.verts = [0.875, 1.0,/*Top-left*/ 0.819, 0.815,/*Bottom-left*/ 0.875, 1.0,/*Top-right*/ 0.932, 0.815/*Bottom-right*/];
        drop1b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop1b);

        const drop1a = new Circle();
        drop1a.position = [0.875, 0.815];
        drop1a.color = [0.655, 0.0, 0.0, 1.0];
        drop1a.size = 11;
        drop1a.segments = 30;
        g_shapesList.push(drop1a);

        const drop2b = new Quad();
        drop2b.verts = [0.52, 0.765,/*Top-left*/ 0.463, 0.575,/*Bottom-left*/ 0.52, 0.765,/*Top-right*/ 0.577, 0.575/*Bottom-right*/];
        drop2b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop2b);

        const drop2a = new Circle();
        drop2a.position = [0.52, 0.575];
        drop2a.color = [0.655, 0.0, 0.0, 1.0];
        drop2a.size = 11;
        drop2a.segments = 30;
        g_shapesList.push(drop2a);

        const drop3b = new Quad();
        drop3b.verts = [0.75, 0.290,/*Top-left*/ 0.693, 0.1,/*Bottom-left*/ 0.75, 0.290,/*Top-right*/ 0.807, 0.1/*Bottom-right*/];
        drop3b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop3b);

        const drop3a = new Circle();
        drop3a.position = [0.75, 0.1];
        drop3a.color = [0.655, 0.0, 0.0, 1.0];
        drop3a.size = 11;
        drop3a.segments = 30;
        g_shapesList.push(drop3a);

        const drop4b = new Quad();
        drop4b.verts = [0.5, -0.11,/*Top-left*/ 0.443, -0.3,/*Bottom-left*/ 0.5, -0.11,/*Top-right*/ 0.557, -0.3/*Bottom-right*/];
        drop4b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop4b);

        const drop4a = new Circle();
        drop4a.position = [0.5, -0.3];
        drop4a.color = [0.655, 0.0, 0.0, 1.0];
        drop4a.size = 11;
        drop4a.segments = 30;
        g_shapesList.push(drop4a);

        const drop5b = new Quad();
        drop5b.verts = [0.85, -0.51,/*Top-left*/ 0.793, -0.7,/*Bottom-left*/ 0.85, -0.51,/*Top-right*/ 0.907, -0.7/*Bottom-right*/];
        drop5b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop5b);

        const drop5a = new Circle();
        drop5a.position = [0.85, -0.7];
        drop5a.color = [0.655, 0.0, 0.0, 1.0];
        drop5a.size = 11;
        drop5a.segments = 30;
        g_shapesList.push(drop5a);

        const drop6b = new Quad();
        drop6b.verts = [-0.85, -0.41,/*Top-left*/ -0.907, -0.6,/*Bottom-left*/ -0.85, -0.41,/*Top-right*/ -0.793, -0.6/*Bottom-right*/];
        drop6b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop6b);

        const drop6a = new Circle();
        drop6a.position = [-0.85, -0.6];
        drop6a.color = [0.655, 0.0, 0.0, 1.0];
        drop6a.size = 11;
        drop6a.segments = 30;
        g_shapesList.push(drop6a);

        const drop7b = new Quad();
        drop7b.verts = [-0.625, 0.225,/*Top-left*/ -0.569, 0.0325,/*Bottom-left*/ -0.625, 0.225,/*Top-right*/ -0.682, 0.0325/*Bottom-right*/];
        drop7b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop7b);

        const drop7a = new Circle();
        drop7a.position = [-0.625, 0.0325];
        drop7a.color = [0.655, 0.0, 0.0, 1.0];
        drop7a.size = 11;
        drop7a.segments = 30;
        g_shapesList.push(drop7a);

        const drop8b = new Quad();
        drop8b.verts = [-0.82, 0.84,/*Top-left*/ -0.763, 0.65,/*Bottom-left*/ -0.82, 0.84,/*Top-right*/ -0.877, 0.65/*Bottom-right*/];
        drop8b.color = [0.655, 0.0, 0.0, 1.0];
        g_shapesList.push(drop8b);

        const drop8a = new Circle();
        drop8a.position = [-0.82, 0.65];
        drop8a.color = [0.655, 0.0, 0.0, 1.0];
        drop8a.size = 11;
        drop8a.segments = 30;
        g_shapesList.push(drop8a);
        

        // Render all shapes
        renderShapes();
    };

    
}

function wipDrawing() {
    //Back of the hair
    const backOfHair = new Quad();
    backOfHair.verts = [-0.38, 0.65,/*Top-left*/ -0.38, -0.25,/*Bottom-left*/ 0.21, 0.65,/*Top-right*/ 0.21, -0.25/*Bottom-right*/];
    backOfHair.color = [0.514, 0.125, 0.98, 1.0];
    g_shapesList.push(backOfHair);

    

    // Scalp/Top of hair
    const scalp1 = new Circle();
    scalp1.position = [-0.11, 0.625];
    scalp1.color = [0.93, 0.125, 0.98, 1.0];
    scalp1.size = 55;
    scalp1.segments = 30;
    g_shapesList.push(scalp1);

    const scalp2 = new Circle();
    scalp2.position = [0.09, 0.65];
    scalp2.color = [0.98, 0.125, 0.62, 1.0];
    scalp2.size = 25;
    scalp2.segments = 30;
    g_shapesList.push(scalp2);

    
    
    // Neck
    const neck = new Quad();
    neck.verts = [-0.185, 0.35,/*Top-left*/ -0.1, -0.0,/*Bottom-left*/ -0.06, 0.35,/*Top-right*/ 0.02, -0.0/*Bottom-right*/];
    neck.color = [1.0, 0.345, 0.0, 1.0];
    g_shapesList.push(neck);

    

    //Sleeves
    const sleeveR = new Quad();
    sleeveR.verts = [-0.465, 0.04,/*Top-left*/ -0.465, -1.0,/*Bottom-left*/ -0.25, 0.04,/*Top-right*/ -0.25, -1.0/*Bottom-right*/];
    sleeveR.color = [0.24, 0.125, 0.98, 1.0];
    g_shapesList.push(sleeveR);

    const sleeveL = new Quad();
    sleeveL.verts = [0.05, 0.04,/*Top-left*/ 0.05, -1.0,/*Bottom-left*/ 0.25, 0.15,/*Top-right*/ 0.25, -1.0/*Bottom-right*/];
    sleeveL.color = [0.24, 0.125, 0.98, 1.0];
    g_shapesList.push(sleeveL);

    const flowR = new Quad();
    flowR.verts = [-0.465, -0.3,/*Top-left*/ -0.76, -1.0,/*Bottom-left*/ -0.465, -0.3,/*Top-right*/ -0.465, -1.0/*Bottom-right*/];
    flowR.color = [0.514, 0.125, 0.98, 1.0];
    g_shapesList.push(flowR);

    const flowL = new Quad();
    flowL.verts = [0.25, -0.25,/*Top-left*/ 0.25, -1.0,/*Bottom-left*/ 0.25, -0.25,/*Top-right*/ 0.585, -1.0/*Bottom-right*/];
    flowL.color = [0.514, 0.125, 0.98, 1.0];
    g_shapesList.push(flowL);

    const shoulderR = new Circle();
    shoulderR.position = [-0.385, 0.07];
    shoulderR.color = [0.047, 0.39, 0.906, 1.0];
    shoulderR.size = 16;
    shoulderR.segments = 30;
    g_shapesList.push(shoulderR);

    const shoulderL = new Circle();
    shoulderL.position = [0.185, 0.145];
    shoulderL.color = [0.047, 0.39, 0.906, 1.0];
    shoulderL.size = 14;
    shoulderL.segments = 30;
    g_shapesList.push(shoulderL);



    // Body
    const abs = new Quad();
    abs.verts = [-0.285, -0.15,/*Top-left*/ -0.12, -0.6,/*Bottom-left*/ 0.2, -0.17,/*Top-right*/ 0.05, -0.6/*Bottom-right*/];
    abs.color = [0.99, 1.0, 0.0, 1.0];
    g_shapesList.push(abs);

    const stomach = new Quad();
    stomach.verts = [0.065, -0.3,/*Top-left*/ -0.4, -0.655,/*Bottom-left*/ 0.065, -0.3,/*Top-right*/ 0.265, -0.655/*Bottom-right*/];
    stomach.color = [0.447, 1.0, 0.0, 1.0];
    g_shapesList.push(stomach);

    const hips = new Quad();
    hips.verts = [-0.4, -0.655,/*Top-left*/ -0.35, -1.0,/*Bottom-left*/ 0.265, -0.655,/*Top-right*/ 0.2, -1.0/*Bottom-right*/];
    hips.color = [0.0, 1.0, 0.678, 1.0];
    g_shapesList.push(hips);


    
    // Chest
    const collarR = new Quad();
    collarR.verts = [-0.37, 0.15,/*Top-left*/ -0.27, -0.1,/*Bottom-left*/ -0.225, 0.115,/*Top-right*/ -0.2, -0.1/*Bottom-right*/];
    collarR.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(collarR);

    const collarL = new Quad();
    collarL.verts = [0.05, 0.13,/*Top-left*/ 0.05, -0.1,/*Bottom-left*/ 0.17, 0.214,/*Top-right*/ 0.17, -0.1/*Bottom-right*/];
    collarL.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(collarL);

    const upperChest = new Quad();
    upperChest.verts = [-0.225, 0.115,/*Top-left*/ -0.22, 0.014,/*Bottom-left*/ 0.075, 0.145,/*Top-right*/ 0.1, 0.0645,/*Bottom-right*/];
    upperChest.color = [1.0, 0.0, 0.0, 1.0];
    g_shapesList.push(upperChest);

    const bR = new Circle();
    bR.position = [-0.17, -0.155];
    bR.color = [1.0, 0.72, 0.15, 1.0];
    bR.size = 31;
    bR.segments = 30;
    g_shapesList.push(bR);

    const bL = new Circle();
    bL.position = [0.085, -0.115];
    bL.color = [1.0, 0.72, 0.15, 1.0];
    bL.size = 31;
    bL.segments = 30;
    g_shapesList.push(bL);

    const chest = new Quad();
    chest.verts = [-0.22, 0.024,/*Top-left*/ -0.2, -0.16,/*Bottom-left*/ 0.1, 0.0645,/*Top-right*/ 0.15, -0.115/*Bottom-right*/];
    chest.color = [1.0, 1.0, 0.71, 1.0];
    g_shapesList.push(chest);


    //Wings
    const wingR = new Quad();
    wingR.n = 4;
    wingR.verts = [0.35, 0.9,/*Top-left*/ 0.2, 0.825,/*Bottom-left*/ 0.425, 0.8,/*Top-right*/ 0.3, 0.775,/*Bottom-right*/];
    wingR.color = [0.447, 1.0, 0.0, 1.0];
    g_shapesList.push(wingR);
    
    const wingRa = new Circle();
    wingRa.position = [0.245, 0.76];
    wingRa.color = [0.0, 0.0, 0.0, 1.0];
    wingRa.size = 14;
    wingRa.segments = 30;
    g_shapesList.push(wingRa);

    const wingRb = new Circle();
    wingRb.position = [0.37, 0.745];
    wingRb.color = [0.0, 0.0, 0.0, 1.0];
    wingRb.size = 14;
    wingRb.segments = 30;
    g_shapesList.push(wingRb);

    const wingL = new Quad();
    wingL.n = 4;
    wingL.verts = [-0.55, 0.9,/*Top-left*/ -0.4, 0.825,/*Bottom-left*/ -0.625, 0.8,/*Top-right*/ -0.5, 0.775,/*Bottom-right*/];
    wingL.color = [0.447, 1.0, 0.0, 1.0];
    g_shapesList.push(wingL);
    
    const wingLa = new Circle();
    wingLa.position = [-0.445, 0.76];
    wingLa.color = [0.0, 0.0, 0.0, 1.0];
    wingLa.size = 14;
    wingLa.segments = 30;
    g_shapesList.push(wingLa);

    const wingLb = new Circle();
    wingLb.position = [-0.57, 0.745];
    wingLb.color = [0.0, 0.0, 0.0, 1.0];
    wingLb.size = 14;
    wingLb.segments = 30;
    g_shapesList.push(wingLb);



    //Head
    const earR = new Quad();
    earR.verts = [-0.44, 0.57,/*Top-left*/ -0.25, 0.315,/*Bottom-left*/ -0.44, 0.57,/*Top-right*/ -0.25, 0.485/*Bottom-right*/];
    earR.color = [1.0, 0.345, 0.0, 1.0];
    g_shapesList.push(earR);

    const earL = new Quad();
    earL.verts = [0.235, 0.525,/*Top-left*/ 0.081, 0.45,/*Bottom-left*/ 0.235, 0.525,/*Top-right*/ 0.081, 0.325/*Bottom-right*/];
    earL.color = [1.0, 0.345, 0.0, 1.0];
    g_shapesList.push(earL);

    const chin = new Quad();
    chin.verts = [-0.3, 0.33,/*Top-left*/ -0.1, 0.215,/*Bottom-left*/ -0.3, 0.33,/*Top-right*/ 0.1, 0.3/*Bottom-right*/];
    chin.color = [1.0, 0.0, 0.0, 1.0];
    g_shapesList.push(chin);

    const cranium = new Quad();
    cranium.verts = [-0.33, 0.75,/*Top-left*/ -0.3, 0.33,/*Bottom-left*/ 0.2, 0.6,/*Top-right*/ 0.1, 0.3/*Bottom-right*/];
    cranium.color = [1.0, 0.0, 0.0, 1.0];
    g_shapesList.push(cranium);



    //Hair
    const sideR = new Quad();
    sideR.n = 3;
    sideR.verts = [-0.365, 0.275,/*Top-left*/ -0.25, 0.13,/*Bottom*/ -0.3, 0.65,/*Top-right*/];
    sideR.color = [0.98, 0.925, 0.125, 1.0];
    g_shapesList.push(sideR);

    const sideL = new Quad();
    sideL.n = 3;
    sideL.verts = [0.175, 0.3,/*Top-left*/ 0.09, 0.13,/*Bottom*/ 0.14, 0.65,/*Top-right*/];
    sideL.color = [0.98, 0.925, 0.125, 1.0];
    g_shapesList.push(sideL);

    const front1 = new Quad();
    front1.n = 4;
    front1.verts = [-0.345, 0.755,/*Top-left*/ -0.33, 0.55,/*Bottom-right*/ 0.05, 0.83,/*Top-right*/ -0.08, 0.65,/*Bottom-left*/];
    front1.color = [0.807, 1.0, 0.561, 1.0];
    g_shapesList.push(front1);

    const front2 = new Quad();
    front2.n = 4;
    front2.verts = [-0.05, 0.8,/*Top-left*/ -0.045, 0.61,/*Bottom-right*/ 0.09, 0.79,/*Top-right*/ 0.055, 0.68,/*Bottom-left*/];
    front2.color = [0.807, 1.0, 0.561, 1.0];
    g_shapesList.push(front2);

    const front3 = new Quad();
    front3.n = 4;
    front3.verts = [0.09, 0.79,/*Top-left*/ 0.07, 0.575,/*Bottom-right*/ 0.14, 0.734,/*Top-right*/ 0.135, 0.675,/*Bottom-left*/];
    front3.color = [0.807, 1.0, 0.561, 1.0];
    g_shapesList.push(front3);

    const bang1 = new Quad();
    bang1.n = 4;
    bang1.verts = [-0.16, 0.83,/*Top-left*/ -0.355, 0.5,/*Bottom-right*/ -0.2, 0.605,/*Top-right*/ -0.34, 0.5,/*Bottom-left*/];
    bang1.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(bang1);

    const bang2 = new Quad();
    bang2.n = 4;
    bang2.verts = [0.05, 0.83,/*Top-left*/ -0.27, 0.5,/*Bottom-right*/ -0.045, 0.61,/*Top-right*/ -0.26, 0.5,/*Bottom-left*/];
    bang2.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(bang2);

    const bang3 = new Quad();
    bang3.n = 4;
    bang3.verts = [0.09, 0.79,/*Top-left*/ -0.0435, 0.475,/*Bottom-right*/ 0.07, 0.575,/*Top-right*/ -0.0385, 0.475,/*Bottom-left*/];
    bang3.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(bang3);

    const bang4 = new Quad();
    bang4.n = 4;
    bang4.verts = [0.125, 0.75,/*Top-left*/ 0.16, 0.48,/*Bottom-right*/ 0.2, 0.61,/*Top-right*/ 0.17, 0.48,/*Bottom-left*/];
    bang4.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(bang4);



    //Face

    //Eyelids
    const lidR = new Quad();
    lidR.n = 6;
    lidR.verts = [-0.1, 0.56,/*Top-left*/ -0.115, 0.5595,/*Top-left-under*/ -0.16, 0.59,/*ml*/ -0.16, 0.5875,/*ml-under*/ -0.23, 0.585,/*tp*/ -0.24, 0.575,/*tp-under*/ -0.275, 0.6];
    lidR.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(lidR);

    const lidL = new Quad();
    lidL.n = 6;
    lidL.verts = [0.01, 0.54,/*Top-left*/ 0.015, 0.535,/*Top-left-under*/ 0.075, 0.55,/*ml*/ 0.075, 0.545,/*ml-under*/ 0.125, 0.53,/*tp*/ 0.115, 0.525,/*tp-under*/ 0.15, 0.5];
    lidL.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(lidL);

    //Eyebrows
    const browR = new Quad();
    browR.n = 6;
    browR.verts = [-0.08, 0.58,/*Top-left*/ -0.095, 0.5795,/*Top-left-under*/ -0.16, 0.61,/*ml*/ -0.16, 0.605,/*ml-under*/ -0.265, 0.65,/*tp*/ -0.265, 0.64,/*tp-under*/ -0.275, 0.64];
    browR.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(browR);

    const browL = new Quad();
    browL.n = 6;
    browL.verts = [0.0, 0.565,/*Top-left*/ 0.014, 0.56,/*Top-left-under*/ 0.075, 0.57,/*ml*/ 0.075, 0.565,/*ml-under*/ 0.125, 0.575,/*tp*/ 0.14, 0.565,/*tp-under*/ 0.15, 0.5];
    browL.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(browL);

    //Eyes
    const eyewR = new Quad();
    eyewR.n = 11;
    eyewR.verts = [-0.245, 0.585,/*tp*/ -0.29, 0.55,/*Top-left*/ -0.265, 0.4725,/*ml*/ -0.21, 0.425,/*Bottom-left*/ -0.18, 0.43,/*bt*/ -0.245, 0.585,/*tp*/ -0.17, 0.5725,/*Top-right*/ -0.265, 0.4725,/*ml*/ -0.1215, 0.5125,/*mt*/ -0.21, 0.425,/*Bottom-left*/ -0.11, 0.425,/*Bottom-right*/ -0.21, 0.425/*Bottom-left*/];
    eyewR.color = [1.0, 0.72, 0.15, 1.0];
    g_shapesList.push(eyewR);

    const eyewL = new Quad();
    eyewL.n = 11;
    eyewL.verts = [0.125, 0.53,/*tp*/ 0.155, 0.475,/*Top-left*/ 0.12, 0.415,/*ml*/ 0.062, 0.396,/*Bottom-left*/ 0.01, 0.4175,/*bt*/ 0.125, 0.53,/*tp*/ 0.06, 0.53,/*Top-right*/ 0.12, 0.415,/*ml*/ 0.0135, 0.49,/*mt*/ 0.062, 0.396,/*Bottom-left*/ -0.015, 0.4175,/*Bottom-right*/ 0.062, 0.396/*Bottom-left*/];
    eyewL.color = [1.0, 0.72, 0.15, 1.0];
    g_shapesList.push(eyewL);

    const irisR = new Circle();
    irisR.color = [1.0, 1.0, 0.71, 1.0];
    irisR.position = [-0.18, 0.505];
    irisR.size = 12;
    irisR.segments = 30;
    g_shapesList.push(irisR);

    const irisL = new Circle();
    irisL.color = [1.0, 1.0, 0.71, 1.0];
    irisL.position = [0.0645, 0.4725];
    irisL.size = 11;
    irisL.segments = 30;
    g_shapesList.push(irisL);

    const lashL = new Quad();
    lashL.n = 10;
    lashL.verts = [-0.015, 0.4175,/*Bottom-left*/ 0.01, 0.5,/*Top-left*/ 0.02, 0.485,/*Top-left-under*/ 0.05, 0.53,/*ml*/ 0.055, 0.515,/*ml-under*/ 0.125, 0.53,/*tp*/ 0.115, 0.515,/*tp-under*/ 0.16, 0.5,/*lash-point-return*/ 0.155, 0.475,/*Bottom-right*/ 0.2, 0.52,/*lash-point*/ ];
    lashL.color = [0.447, 1.0, 0.0, 1.0];
    g_shapesList.push(lashL);

    const lashR = new Quad();
    lashR.n = 10;
    lashR.verts = [-0.11, 0.425,/*Bottom-left*/ -0.115, 0.52,/*Top-left*/ -0.13, 0.5075,/*Top-left-under*/ -0.16, 0.5725,/*ml*/ -0.17, 0.556,/*ml-under*/ -0.23, 0.585,/*tp*/ -0.24, 0.565,/*tp-under*/ -0.275, 0.576,/*lash-point-return*/ -0.285, 0.545,/*Bottom-right*/ -0.34, 0.6,/*lash-point*/ ];
    lashR.color = [0.447, 1.0, 0.0, 1.0];
    g_shapesList.push(lashR);

    //Nose
    const nose = new Quad();
    nose.n = 3;
    nose.verts = [-0.07, 0.345,/*Bottom-Left*/ -0.05, 0.345,/*Bottom-Right*/ -0.045, 0.36/*Top-Right*/];
    nose.color = [0.0, 0.83, 1.0, 1.0];
    g_shapesList.push(nose);

    //Mouth
    const mouth = new Quad();
    mouth.n = 6;
    mouth.verts = [-0.13, 0.29,/*Top-Left*/ -0.09, 0.315,/*ml*/ -0.08, 0.305,/*ml-under*/ -0.03475, 0.31,/*tp*/ -0.03475, 0.295,/*tp-under*/ -0.035, 0.275/*Top-Right*/ -0.03475, 0.285,/*Top-Right-under*/];
    mouth.color = [0.0, 0.57, 1.0, 1.0];
    g_shapesList.push(mouth);

    //Fang
    const fang = new Quad();
    fang.n = 3;
    fang.verts = [-0.065, 0.305,/*Top-Left*/ -0.06, 0.26,/*bt*/ -0.04, 0.295/*Top-Right*/];
    fang.color = [0.24, 0.125, 0.98, 1.0];
    g_shapesList.push(fang);

    //Blush
    const blush1R = new Quad();
    blush1R.n = 4;
    blush1R.verts = [-0.25, 0.39,/*Top-Left*/ -0.245, 0.385,/*bt*/ -0.24, 0.38,/*Bottom-Right*/ -0.22, 0.415,/*tp*/];
    blush1R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush1R);

    const blush2R = new Quad();
    blush2R.n = 4;
    blush2R.verts = [-0.225, 0.385,/*Top-Left*/ -0.22, 0.38,/*bt*/ -0.215, 0.375,/*Bottom-Right*/ -0.195, 0.41,/*tp*/];
    blush2R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush2R);

    const blush3R = new Quad();
    blush3R.n = 4;
    blush3R.verts = [-0.2, 0.38,/*Top-Left*/ -0.195, 0.375,/*bt*/ -0.19, 0.37,/*Bottom-Right*/ -0.17, 0.405,/*tp*/];
    blush3R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush3R);

    const blush4R = new Quad();
    blush4R.n = 4;
    blush4R.verts = [-0.1, 0.39,/*Top-Left*/ -0.095, 0.385,/*bt*/ -0.09, 0.38,/*Bottom-Right*/ -0.07, 0.415,/*tp*/];
    blush4R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush4R);

    const blush5R = new Quad();
    blush5R.n = 4;
    blush5R.verts = [-0.075, 0.385,/*Top-Left*/ -0.07, 0.38,/*bt*/ -0.065, 0.375,/*Bottom-Right*/ -0.045, 0.41,/*tp*/];
    blush5R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush5R);

    const blush6R = new Quad();
    blush6R.n = 4;
    blush6R.verts = [-0.050, 0.38,/*Top-Left*/ -0.045, 0.375,/*bt*/ -0.04, 0.37,/*Bottom-Right*/ -0.02, 0.405,/*tp*/];
    blush6R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush6R);

    const blush7R = new Quad();
    blush7R.n = 4;
    blush7R.verts = [0.01, 0.36,/*Top-Left*/ 0.015, 0.355,/*bt*/ 0.02, 0.35,/*Bottom-Right*/ 0.04, 0.385,/*tp*/];
    blush7R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush7R);

    const blush8R = new Quad();
    blush8R.n = 4;
    blush8R.verts = [0.035, 0.355,/*Top-Left*/ 0.04, 0.35,/*bt*/ 0.045, 0.345,/*Bottom-Right*/ 0.065, 0.38,/*tp*/];
    blush8R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush8R);

    const blush9R = new Quad();
    blush9R.n = 4;
    blush9R.verts = [0.06, 0.35,/*Top-Left*/ 0.065, 0.345,/*bt*/ 0.07, 0.34,/*Bottom-Right*/ 0.09, 0.375,/*tp*/];
    blush9R.color = [0.0, 0.0, 1.0, 1.0];
    g_shapesList.push(blush9R);



    //Droplets
    const drop1b = new Quad();
    drop1b.verts = [0.875, 1.0,/*Top-left*/ 0.819, 0.815,/*Bottom-left*/ 0.875, 1.0,/*Top-right*/ 0.932, 0.815/*Bottom-right*/];
    drop1b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop1b);

    const drop1a = new Circle();
    drop1a.position = [0.875, 0.815];
    drop1a.color = [1.0, 0.0, 0.0, 1.0];
    drop1a.size = 11;
    drop1a.segments = 30;
    g_shapesList.push(drop1a);

    const drop2b = new Quad();
    drop2b.verts = [0.52, 0.765,/*Top-left*/ 0.463, 0.575,/*Bottom-left*/ 0.52, 0.765,/*Top-right*/ 0.577, 0.575/*Bottom-right*/];
    drop2b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop2b);

    const drop2a = new Circle();
    drop2a.position = [0.52, 0.575];
    drop2a.color = [1.0, 0.0, 0.0, 1.0];
    drop2a.size = 11;
    drop2a.segments = 30;
    g_shapesList.push(drop2a);

    const drop3b = new Quad();
    drop3b.verts = [0.75, 0.290,/*Top-left*/ 0.693, 0.1,/*Bottom-left*/ 0.75, 0.290,/*Top-right*/ 0.807, 0.1/*Bottom-right*/];
    drop3b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop3b);

    const drop3a = new Circle();
    drop3a.position = [0.75, 0.1];
    drop3a.color = [1.0, 0.0, 0.0, 1.0];
    drop3a.size = 11;
    drop3a.segments = 30;
    g_shapesList.push(drop3a);

    const drop4b = new Quad();
    drop4b.verts = [0.5, -0.11,/*Top-left*/ 0.443, -0.3,/*Bottom-left*/ 0.5, -0.11,/*Top-right*/ 0.557, -0.3/*Bottom-right*/];
    drop4b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop4b);

    const drop4a = new Circle();
    drop4a.position = [0.5, -0.3];
    drop4a.color = [1.0, 0.0, 0.0, 1.0];
    drop4a.size = 11;
    drop4a.segments = 30;
    g_shapesList.push(drop4a);

    const drop5b = new Quad();
    drop5b.verts = [0.85, -0.51,/*Top-left*/ 0.793, -0.7,/*Bottom-left*/ 0.85, -0.51,/*Top-right*/ 0.907, -0.7/*Bottom-right*/];
    drop5b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop5b);

    const drop5a = new Circle();
    drop5a.position = [0.85, -0.7];
    drop5a.color = [1.0, 0.0, 0.0, 1.0];
    drop5a.size = 11;
    drop5a.segments = 30;
    g_shapesList.push(drop5a);

    const drop6b = new Quad();
    drop6b.verts = [-0.85, -0.41,/*Top-left*/ -0.907, -0.6,/*Bottom-left*/ -0.85, -0.41,/*Top-right*/ -0.793, -0.6/*Bottom-right*/];
    drop6b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop6b);

    const drop6a = new Circle();
    drop6a.position = [-0.85, -0.6];
    drop6a.color = [1.0, 0.0, 0.0, 1.0];
    drop6a.size = 11;
    drop6a.segments = 30;
    g_shapesList.push(drop6a);

    const drop7b = new Quad();
    drop7b.verts = [-0.625, 0.225,/*Top-left*/ -0.569, 0.0325,/*Bottom-left*/ -0.625, 0.225,/*Top-right*/ -0.682, 0.0325/*Bottom-right*/];
    drop7b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop7b);

    const drop7a = new Circle();
    drop7a.position = [-0.625, 0.0325];
    drop7a.color = [1.0, 0.0, 0.0, 1.0];
    drop7a.size = 11;
    drop7a.segments = 30;
    g_shapesList.push(drop7a);

    const drop8b = new Quad();
    drop8b.verts = [-0.82, 0.84,/*Top-left*/ -0.763, 0.65,/*Bottom-left*/ -0.82, 0.84,/*Top-right*/ -0.877, 0.65/*Bottom-right*/];
    drop8b.color = [0.906, 0.663, 0.0, 1.0];
    g_shapesList.push(drop8b);

    const drop8a = new Circle();
    drop8a.position = [-0.82, 0.65];
    drop8a.color = [1.0, 0.0, 0.0, 1.0];
    drop8a.size = 11;
    drop8a.segments = 30;
    g_shapesList.push(drop8a);
    

    // Render all shapes
    renderShapes();
}