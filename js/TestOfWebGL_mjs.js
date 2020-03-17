function ConvertToString(array) {
    var strRep = '';
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        strRep += element + ' ';
    }
    return strRep;
}

function TestWebGL_mjs() {
    var u = V3.$(1,2,3);
    var v = V3.$(4,5,6);

    var s = V3.add(u, v);
    alert(ConvertToString(s));

    var d = V3.dot(u, v);
    alert(d);

    var c = V3.cross(u, v);
    alert(ConvertToString(c));

    var M = M4x4.$(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        2,3,4,1,
    );
     
    var N = M4x4.$(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1,
    );

    var MN = M4x4.mul(M, N);
    alert(ConvertToString(MN));

    var I = M4x4.makeTranslate3(2,3,4);
    alert(ConvertToString(I));
}