var gl;
var canvas;
var shaderProgram;
var floorVertexPositionBuffer;
var floorVertexIndexBuffer;
var cubeVertexPositionBUffer;
var cubeVertexIndexBuffer;
var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixStack;

function createGLContext(canvas) {
    var context = null;
    var names = ["webgl", "experimental-webgl"];

    for (let index = 0; index < names.length; index++) {
        const name = names[index];
        try {
            context = canvas.getContext(name);
        } catch (error) {
            
        }

        if (context) {
            break;
        }
    }

    if (context) {
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    } else {
        alert("Fail to create webgl context.");
    }

    return context;
}

function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    var shaderSource = "";
    var curChild = shaderScript.firstChild;
    while (curChild) {
        if (curChild.nodeType == 3) {
            shaderSource += curChild.textContent;
        }
        curChild = curChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else{
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function setupShaders() {
    var vertexShader = loadShaderFromDOM("shader-vs");
    var fragmentShader = loadShaderFromDOM("shader-fs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Fail to setup shaders.");
    }

    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    shaderProgram.uniformMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix")
    shaderProgram.uniformProjMatrix = gl.getUniformLocation(shaderProgram, "uPMatrix")
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    modelViewMatrix = mat4.create();
    projectionMatrix = mat4.create();
    modelViewMatrixStack = [];
}

function pushModelViewMatrix() {
    var copyToPush = mat4.create(modelViewMatrix);
    modelViewMatrixStack.push(copyToPush);
}

function popModelViewMatrix() {
    if (modelViewMatrixStack.length == 0) {
        throw "Error, stack was empty";
    }

    modelViewMatrix = modelViewMatrixStack.pop();
}

function setupFloorBuffers() {   
  floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
  
  var floorVertexPosition = [
      // Plane in y=0
       5.0,   0.0,  5.0,  //v0
       5.0,   0.0, -5.0,  //v1
      -5.0,   0.0, -5.0,  //v2
      -5.0,   0.0,  5.0]; //v3
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition),
                gl.STATIC_DRAW);
  
  floorVertexPositionBuffer.itemSize = 3;
  floorVertexPositionBuffer.numberOfItems = 4;
  
  floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
  var floorVertexIndices = [0, 1, 2, 3];  
            
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), 
                gl.STATIC_DRAW);
  floorVertexIndexBuffer.itemSize = 1;
  floorVertexIndexBuffer.numberOfItems = 4;
}

function setupCubeBuffers() {
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  
  var cubeVertexPosition = [
       // Front face
       1.0,  1.0,  1.0, //v0
      -1.0,  1.0,  1.0, //v1
      -1.0, -1.0,  1.0, //v2
       1.0, -1.0,  1.0, //v3

       // Back face
       1.0,  1.0, -1.0, //v4
      -1.0,  1.0, -1.0, //v5
      -1.0, -1.0, -1.0, //v6
       1.0, -1.0, -1.0, //v7
       
       // Left face
      -1.0,  1.0,  1.0, //v8
      -1.0,  1.0, -1.0, //v9
      -1.0, -1.0, -1.0, //v10
      -1.0, -1.0,  1.0, //v11
       
       // Right face
       1.0,  1.0,  1.0, //12
       1.0, -1.0,  1.0, //13
       1.0, -1.0, -1.0, //14
       1.0,  1.0, -1.0, //15
       
        // Top face
        1.0,  1.0,  1.0, //v16
        1.0,  1.0, -1.0, //v17
       -1.0,  1.0, -1.0, //v18
       -1.0,  1.0,  1.0, //v19
       
        // Bottom face
        1.0, -1.0,  1.0, //v20
        1.0, -1.0, -1.0, //v21
       -1.0, -1.0, -1.0, //v22
       -1.0, -1.0,  1.0, //v23
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition),
                gl.STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numberOfItems = 24; 
  
  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 6, 5,      4, 7, 6,    // Back face
            8, 9, 10,     8, 10, 11,  // Left face
            12, 13, 14,   12, 14, 15, // Right face
            16, 17, 18,   16, 18, 19, // Top face
            20, 22, 21,   20, 23, 22  // Bottom face
        ];
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), 
                gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numberOfItems = 36;
}

function setupBuffers() {
  setupFloorBuffers();
  setupCubeBuffers();
}

function uploadModelViewMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false, modelViewMatrix);
}

function uploadProjectionMatrixToShader() {
    gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false, projectionMatrix);
}

function drawFloor(r,g,b,a) {
    gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
    gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLE_FAN, floorVertexIndexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
}

function drawCube(r,g,b,a) {
    gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
    gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
}

function drawTable() {
    pushModelViewMatrix();
    mat4.translate(modelViewMatrix, [0.0, 1.0, 0.0], modelViewMatrix);
    mat4.scale(modelViewMatrix, [2.0, 0.1, 2.0], modelViewMatrix);
    uploadModelViewMatrixToShader();

    drawCube(0.72, 0.53, 0.04, 1.0);
    popModelViewMatrix();

    for (let i = -1; i <= 1; i += 2) {
        for (let j = -1; j <= 1; j += 2) {
            pushModelViewMatrix();
            mat4.translate(modelViewMatrix, [i*1.9, -0.1, j*1.9], modelViewMatrix);
            mat4.scale(modelViewMatrix, [0.1, 1.0, 0.1], modelViewMatrix);
            uploadModelViewMatrixToShader();
            drawCube(0.72, 0.53, 0.04, 1.0);
            popModelViewMatrix();
        }        
    }
}

function draw() {
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(60, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projectionMatrix);
    mat4.identity(modelViewMatrix);
    mat4.lookAt([8, 5, -10],[0, 0, 0], [0, 1, 0], modelViewMatrix);
    
    uploadModelViewMatrixToShader();
    uploadProjectionMatrixToShader();
    
    // Draw floor in red color
    drawFloor(1.0, 0.0, 0.0, 1.0);
    
    // Draw table
    pushModelViewMatrix();
    mat4.translate(modelViewMatrix, [0.0, 1.1, 0.0], modelViewMatrix);
    uploadModelViewMatrixToShader();
    drawTable();
    popModelViewMatrix();

    // Draw box on top of the table
    pushModelViewMatrix();
    mat4.translate(modelViewMatrix, [0.0, 2.7, 0.0], modelViewMatrix);
    mat4.scale(modelViewMatrix, [0.5, 0.5, 0.5], modelViewMatrix);
    uploadModelViewMatrixToShader();
    drawCube(0.0, 0.0, 1.0, 1.0);
    popModelViewMatrix();
}

function startup() {
    canvas = document.getElementById("GLCanvas");
    gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
    setupShaders();
    setupBuffers();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    draw();
}