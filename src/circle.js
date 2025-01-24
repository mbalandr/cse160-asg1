/*
Mariah Balandran
mbalandr@ucsc.edu

Notes to Grader:
Followed video tutorial playlist provided at the top of the assignment.
*/

class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10;
        this.rotation = Math.random() * 360;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw
        var d = size/200.0; // delta

        // Starting angle offset to rotate a triangle
        var startAngle = this.rotation;
        
        var angleStep = 360/this.segments;
        for(var angle = startAngle; angle < startAngle + 360; angle = angle + angleStep) {
            var centerPt = [xy[0], xy[1]];
            var angle1 = angle;
            var angle2 = angle + angleStep;
            
            var vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            var vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            var pt1  = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
            var pt2  = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

            drawTriangle( [xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]] );
        }
    }
}