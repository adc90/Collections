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

function sortFn() {
    var sortByProps = Array.prototype.slice.call(arguments),
        cmpFn = function(left, right, sortOrder) {
            var sortMultiplier = sortOrder === "asc" ? 1 : -1;

            if (left > right) {
                return +1 * sortMultiplier;
            }
            if (left < right) {
                return -1 * sortMultiplier;
            }
            return 0;
        };


    return function(sortLeft, sortRight) {
        // get value from object by complex key
        var getValueByStr = function(obj, path) {
            var i, len;

            //prepare keys
            path = path.replace('[', '.');
            path = path.replace(']', '');
            path = path.split('.');

            len = path.length;

            for (i = 0; i < len; i++) {
                if (!obj || typeof obj !== 'object') {
                    return obj;
                }
                obj = obj[path[i]];
            }

            return obj;
        };

        return sortByProps.map(function(property) {
            return cmpFn(getValueByStr(sortLeft, property.prop), getValueByStr(sortRight, property.prop), property.sortOrder);
        }).reduceRight(function(left, right) {
            return right || left;
        });
    };
}

var arr = [
    { name: 'marry', LocalizedData: { 'en-US': { Value: 10000 } } },
    { name: 'larry', LocalizedData: { 'en-US': { Value: 2 } } },
    { name: 'marry', LocalizedData: { 'en-US': { Value: 100 } } },
    { name: 'larry', LocalizedData: { 'en-US': { Value: 1 } } }
];


arr.sort(sortFn({
    prop: "name",
    sortOrder: "asc"
}, {
    prop: "LocalizedData[en-US].Value",
    sortOrder: "desc"
}));
console.log(arr);

