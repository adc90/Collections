/**
 * Created by adc90 on 1/15/2017.
 */

var Collections = require('../collections');
var testData = require('./TestData');

var data = Collections.ToCollection(testData.Family)
    .OrderBy(function(f) {
        return f.FirstName;
    }).ThenBy(function(f){
        return f.Age;
    }).Collect();

console.log(data);

