var gl;
var canvas;
var shaderProgram;
var vertexBuffer;

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
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

function setupBuffers() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var triangleVertices = [
        //(x, y, z) (r, g, b, a)
        0.0, 0.5, 0.0, 255, 0, 0, 255,
        -0.5, -0.5, 0.0, 0, 255, 0, 255,
        0.5, -0.5, 0.0, 9, 0, 0, 255, 255
    ];

    var nbrOfVertices = 3;
    var vertexSizeInBytes = 3 * Float32Array.BYTES_PER_ELEMENT + 4 * Uint8Array.BYTES_PER_ELEMENT;
    var vertexSizeInFloat = vertexSizeInBytes / Float32Array.BYTES_PER_ELEMENT;
    var buffer = new ArrayBuffer(nbrOfVertices * vertexSizeInBytes);
    var positionView = new Float32Array(buffer);
    var colorView = new Uint8Array(buffer);

    var positionOffsetInFloats = 0;
    var colorOffsetInBytes = 12;
    var k = 0;
    for (let i = 0; i < nbrOfVertices; i++) {
        positionView[positionOffsetInFloats] = triangleVertices[k];
        positionView[positionOffsetInFloats+1] = triangleVertices[k+1];
        positionView[positionOffsetInFloats+2] = triangleVertices[k+2];
        colorView[colorOffsetInBytes] = triangleVertices[k+3];
        colorView[colorOffsetInBytes+1] = triangleVertices[k+4];
        colorView[colorOffsetInBytes+2] = triangleVertices[k+5];
        colorView[colorOffsetInBytes+3] = triangleVertices[k+6];

        positionOffsetInFloats += vertexSizeInFloat;
        colorOffsetInBytes += vertexSizeInBytes;
        k += 7;
    }

    gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW);
    vertexBuffer.positionSize = 3;
    vertexBuffer.colorSize = 4;
    vertexBuffer.numberOfItems = 3;
}

function draw() {
    gl.viewport(0,0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.positionSize, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexBuffer.colorSize, gl.UNSIGNED_BYTE, true, 16, 12);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);    
}

function startup() {
    canvas = document.getElementById("GLCanvas");
    gl = WebGLDebugUtils.makeDebugContext(createGLContext(canvas));
    setupShaders();
    setupBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    draw();
}