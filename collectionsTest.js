/**
 * Created by adc90 on 12/6/2016.
 */

QUnit.test("Collections test", function (assert) {

    //Setup
    var rng = Collections.ToCollection(Collections.Range(1,5))
        .Sum(function (f) {
            return f;
        });
    var val1 = 1;
    var val2 = 1;

    /*
    var nums1 = Collections.ToCollection([2,7,5,6])
        .OrderByDescending(function(f) {
            return f;
        }).ForEach(function(i,f) {
            val2 *= f;
        });

    var nums2 = Collections.ToCollection([2,7,5,6])
        .OrderBy(function(f) {
            return f;
        }).ForEach(function(i,f) {
            val1 *= f;
        });

    var

    alert(val);
    //Assert
    assert.ok(rng === 15, "rng === 15");
    assert.ok(nums1 === "1 * 2 * 5 * 6", "nums === 60");
    assert.ok(nums2 === "2 * 1 * 5 * 6", "nums === 60");
    */



});