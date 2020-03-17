vec3 = glMatrix.vec3
mat4 = glMatrix.mat4

function TestGLMatrix() {
    var u = vec3.clone([1,2,3]);
    var v = vec3.clone([4,5,6]);
    var r = vec3.create();
    var t = vec3.clone([1,2,3]);

    var s = vec3.add(r, u, v);
    alert(vec3.str(s));
    alert(vec3.str(r));
    alert(vec3.str(u));

    var d = vec3.dot(u, v);
    alert(d);

    var c = vec3.cross(t, v, r);
    alert(vec3.str(r));

    var M = mat4.create(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        2,3,4,1,
    );
     
    var I = mat4.create(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1,
    );

    var IM = mat4.create();
    mat4.multiply(I, M, IM);
    alert(mat4.str(IM));

    var T = mat4.create();
    mat4.translate(I, [2,3,4], T);
    alert(mat4.str(T));
}