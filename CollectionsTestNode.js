/**
 * Created by adc90 on 12/14/2016.
 */


var testData = require('./TestData.js');
var Collections = require('./collections2.js');

var chai = require('chai');
var expect = chai.expect;


describe('Test', function () {
    it('Some function', function () {
        var a = 1;
        expect(1).to.equal(1);
    });

});

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
    });


console.log(active.Sum(function(v){
    return parseFloat(v.balance);
}));