/*
Mariah Balandran
mbalandr@ucsc.edu

Notes to Grader:
I referenced the other shape classes from the instructor videos to adapt the HelloQuad.js code into a new shape class.
*/

class Quad {
    constructor() {
        this.type = 'quad';
        this.verts = [-0.5, 0.5,/*Top-left*/ -0.5, -0.5, /*Bottom-left*/ 0.5, 0.5, /*Top-right*/ 0.5, -0.5 /*Bottom-right*/];
        this.position = [0.0, 0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 0;
        this.n = 4;
    }

    render() {
        var rgba = this.color;
        var vt = this.verts;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw the quad
        this.drawQuad(vt);
    }

    drawQuad(vertices) {
        // Number of vertices
        const n = this.n;

        // Create a buffer object
        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        // Write vertex data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Draw the quad as a triangle strip
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}
