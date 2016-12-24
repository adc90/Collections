/**
 * Created by adc90 on 12/14/2016.
 */


var testData = require('./TestData.js');
var Collections = require('./collections2.js');

var active = Collections.ToCollection(testData)
    .Select(function(i,v){
        var nm = v.name.split(" ");
        return {
            id: v.id,
            index: v.index,
            guid: v.guid,
            isActive: v.isActive,
            balance: parseFloat(v.balance.replace("$","").replace(",","")),
            age: v.age,
            eyeColor: v.eyeColor,
            firstNm: nm[0],
            lastNm: nm[1],
            gender: v.gender,
            company: v.company,
            email: v.email,
            phone: v.phone
        };
    }).OrderBy(function(f){
        return f.lastNm;
    }).ThenBy(function(f) {
        return f.lastNm;
    }).Collect();

//var arr = [
//    { name: 'marry', Total: 1, age: 2 },
//    { name: 'larry',  Total: 2, age: 3 },
//    { name: 'marry',  Total: 3, age: 3 },
//    { name: 'larry',  Total: 3, age: 3 },
//    { name: 'larry',  Total: 3, age: 4 },
//];
//function test (a,b) {
//    if(a.Total>b.Total) {
//        return 1;
//    } else if(a.Total<b.Total)  {
//        return -1;
//    } else {
//        return 0;
//    }
//}
//
//var x = arr.sort(function(a,b){
//    if(a.Name>b.Name) {
//        return 1;
//    } else if(a.Name<b.Name) {
//        return -1;
//    } else {
//        return test(a,b);
//    }
//});

//console.log(x);
