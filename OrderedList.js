/**
 * Created by adc90 on 12/11/2016.
 */

function OrderedList(array, comparisonFunc) {
    this.collection = null;
    this.comparisonFunction = null;
    var constructorCheck = {arrayInd: false, comparisonInd: false};

    if(array){
        if(!array instanceof Array) {
            throw new Error("Constructor only accepts type of Array");
        }
        constructorCheck.arrayInd = true;
    }
    if(comparisonFunc) {
        if(!comparisonFunc instanceof Function) {
            throw new Error("comparisonFunc must be a function");
        }
        constructorCheck.comparisonInd = true;
    }
    this.collection = constructorCheck.arrayInd ? array : [];

    this.comparisonFunction = constructorCheck.comparisonInd
        ? comparisonFunc
        : function(a, b) { return a > b ? 1 : (a < b ? -1 : 0); };

    this.collection.sort(function(a,b){
        return this.comparisonFunction(a,b);
    }.bind(this));

    return this;
}

OrderedList.prototype.Add = function(val) {
    this.collection.push(val);
    this.collection.sort(function(a,b){
        return this.comparisonFunction(a,b);
    }.bind(this));
};

OrderedList.prototype.Clear = function() {
    this.collection = [];
    return this;
};

OrderedList.prototype.Collect = function() {
    return this.collection;
};
