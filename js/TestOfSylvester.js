function TestSylvester() {
    var u = Vector.create([1,2,3]);
    var v = Vector.create([4,5,6]);

    var s = u.add(v);
    alert(s.inspect());

    var d = u.dot(v);
    alert(d);

    var c = u.cross(v);
    alert(c.inspect());

    var M = Matrix.create(
        [2,-1],
        [-2,1],
        [-1, 2]
    );
     
    var N = Matrix.create(
        [4,-3],
        [3,5]
    );

    var MN = M.multiply(N);
    //alert(MN.inspect());

    var I = Matrix.I(4);
    alert(I.inspect());
}