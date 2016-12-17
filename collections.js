
/*
 * Constructor for the collections
 */
function Collections(array) {
    function Util() { }

    Util.prototype.isEqual = function(a, b) {
        if(typeof a !== typeof b)
            return false;
        if(typeof a !== "object")
            return a === b;

        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);
        if(aProps.length !== bProps.length) {
            return false;
        }
        for(var i = 0; i < aProps.length; i++){
            var propName = aProps[i];
            if(a[propName] !== b[propName]){
                return false;
            }
        }
        return true;
    };

    Util.prototype.compareTo = function(a, b) {
        return a > b ? 1 : (a < b ? -1 : 0);
    };

    Util.prototype.identityFunction = function(v) {
        return v;
    };

    this.utilities = new Util();
    this.collection = array;
}

Collections.ToCollection = function (array) {
    return new Collections(array);
};

Collections.prototype = {
    Collect:  function () {
        return this.collection;
    },

    Difference: function(rightCollection, comparisonFunction){
        throw new Error("Not implemented exception");
    },

    Intersection: function(rightCollection, comparisonFunction) {
        var result = [];

        var compareTo = function(a,b) {
            return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                ? comparisonFunction(a) === comparisonFunction(b)
                : this.utilities.isEqual(a,b);
        }.bind(this);

        this.ForEach(function (idx, val) {
            for(var i = 0; i < rightCollection.length; i++){
                if(compareTo(val, rightCollection[i])) {
                    result.push(val);
                }
            }
        });

        this.collection = result;
        return this;
    },

    PullAt: function(array) {
        var result = [];
        for(var i = 0; i < array.length; i++) {
            result.push(this.collection[array[i]]);
        }
        this.collection = result;

        return this;
    },

    Where:  function (predicate) {
        var results = [];
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                results.push(this.collection[i]);
            }
        }
        this.collection = results;
        return this;
    },

    First: function (predicate) {
        if (predicate === undefined) {
            return this.collection[0];
        }
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                return this.collection[i];
            }
        }
        return null;
    },

    Last: function(predicate) {
        if (predicate === undefined) {
            return this.collection[this.collection.length - 1];
        }
        for(var i = this.collection.length; i > 0; i--) {
            if (predicate(this.collection[i])) {
                return this.collection[i];
            }
        }
    },

    Reduce:  function (reductionFunction) {
        var val = undefined;
        if(this.collection === 1) {
            return this.collection[0];
        } else {
            this.ForEach(function(i,v){
                if(i === 0) {
                    val = v;
                } else {
                    val = reductionFunction(val, v);
                }
            });
        }
        return val;
    },

    ToDictionary: function(keySelector, valueSelector) {
        var dictionary = new Dictionary();
        this.ForEach(function(i, v) {
            dictionary.Add(keySelector(v), valueSelector(v));
        });
        return dictionary;
    },

    Contains:  function (item) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i] === item) {
                return true;
            }
        }
        return false;
    },

    //JavaScript's map does the same thing more or less
    Select: function (valueSelector) {
        var result = [];
        for (var i = 0; i < this.collection.length; i++) {
            result.push(valueSelector(this.collection[i]));
        }
        this.collection = result;
        return this;
    },

    Average: function(valueSelector) {
        var length = this.collection.length;
        var sum = this.Sum(valueSelector);

        return sum / length;
    },

    SelectIndex:  function (valueSelector) {
        var result = [];
        for (var i = 0; i < this.collection.length; i++) {
            result.push(valueSelector(i, this.collection[i]));
        }
        this.collection = result;
        return this;
    },

    Pluck:  function(items) {
        this.Select(function(f){
            var obj = {};
            for(var i = 0; i < items.length; i++) {
                if(f.hasOwnProperty(items[i])) {
                    obj[items[i]] = f[items[i]];
                }
            }
            return obj;
        });
        return this;
    },

    Count: function (predicate) {
        if (predicate === undefined) {
            return this.collection.length;
        }
        var cnt = 0;
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                cnt++;
            }
        }
        return cnt;
    },

    All: function (predicate) {
        for (var i = 0; i < this.collection.length; i++) {
            if (!predicate(this.collection[i])) {
                return false;
            }
        }
        return true;
    },

    Flatten:  function() {

        function flatten(collection) {
            return collection.reduce(function(a,b){
                if(Array.isArray(b)) {
                    return a.concat(flatten(b))
                }
                return a.concat(b);
            }, [])
        }
        this.collection = flatten(this.collection);

        return this;
    },

    Any: function (predicate) {
        if (predicate === undefined) {
            return this.collection.length > 0;
        }
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                return true;
            }
        }
        return false;
    },

    GroupBy: function (keyFunction) {
        var groups = {};
        for (var i = 0; i < this.collection.length; i++) {
            var key = keyFunction(this.collection[i]);
            if (key in groups === false) {
                groups[key] = [];
            }
            groups[key].push(this.collection[i]);

        }
        this.collection = Object.keys(groups).map(function (key) {
            return {
                key: key,
                values: groups[key]
            };
        });

        return this;
    },

    OrderBy: function (orderSelector, comparisonFunc) {
        var compareTo = typeof comparisonFunc === "function" ? comparisonFunc : this.utilities.compareTo;

        this.collection.sort(function (a, b) {
            return compareTo(orderSelector(a),orderSelector(b));
        }.bind(this));

        return this;
    },

    OrderByDescending:  function (orderSelector, comparisonFunc) {
        var compareTo = typeof comparisonFunc === "function" ? comparisonFunc : this.utilities.compareTo;

        this.collection = this.collection.sort(function (a, b) {
            return compareTo(orderSelector(b),orderSelector(a));
        }.bind(this));

        return this;
    },

    Join: function (rightCollection, leftKey, rightKey, selectedResult) {
        var result = [];
        var leftIntermediateResult = [];
        var rightIntermediateResult = [];
        for (var i = 0; i < this.collection.length; i++) {
            var lKey = leftKey(this.collection[i]);
            var leftObj = null;
            var rightObj = null;
            for (var j = 0; j < rightCollection.length; j++) {
                var rKey = rightKey(rightCollection[j]);
                if (lKey === rKey) {
                    leftObj = {};
                    rightObj = {};
                    for (var lVal in this.collection[i]) {
                        leftObj[lVal] = this.collection[i][lVal];
                    }
                    for (var rVal in rightCollection[j]) {
                        rightObj[rVal] = rightCollection[j][rVal];
                    }
                    leftIntermediateResult.push(leftObj);
                    rightIntermediateResult.push(rightObj);
                }
            }
        }

        for (var k = 0; k < leftIntermediateResult.length; k++) {
            result.push(selectedResult(leftIntermediateResult[k], rightIntermediateResult[k]));
        }
        this.collection = result;

        return this;
    },

    Reverse:  function() {
        var result = [];
        for (var i = this.collection.length - 1; i > -1; i--) {
            result.push(this.collection[i]);
        }
        this.collection = result;

        return this;
    },

    Without: function (predicate) {
        var result = [];
        for (var i = 0; i < this.collection.length; i++) {
            if (!predicate(this.collection[i])) {
                result.push(this.collection[i]);
            }
        }
        this.collection = result;
        return this;
    },

    TakeWhile:  function (predicate) {
        var result = [];

        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                result.push(this.collection[i]);
            }else{
                break;
            }
        }
        this.collection = result;
        return this;
    },

    Union: function(rightCollection, valueSelector) {
        this.collection = this.collection.concat(rightCollection);
        this.Distinct(valueSelector);

        return this;
    },

    Distinct: function (comparisonFunction) {
        var result = [];
        //If were're supplied with a value selector function we'll use that to compare the values.
        //Otherwise we'll use the default deep compare as supplied by the utilities class in this library
        var compareTo = function(a,b) {
            return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                ? comparisonFunction(a) === comparisonFunction(b)
                : this.utilities.isEqual(a,b);
        }.bind(this);

        function exists(results, item) {
            var inArray = false;
            for(var i = 0; i < result.length; i++) {
                if(compareTo(result[i], item))
                    return true;
            }
            return inArray;
        }

        for (var i = 0; i < this.collection.length; i++) {
            if(!exists(result, this.collection[i])){
                result.push(this.collection[i]);
            }
        }
        this.collection = result;

        return this;
    },

    Sum:  function (valueSelector) {
        if (valueSelector === undefined) {
            valueSelector = this.utilities.identityFunction;
        }

        var sum = 0;
        for (var i = 0; i < this.collection.length; i++) {
            sum += valueSelector(this.collection[i]);
        }
        return sum;
    },

    Min: function (valueSelector) {
        var len = this.collection.length;
        var min = Infinity;

        while (len--) {
            if (Number(valueSelector(this.collection[len])) < min) {
                min = Number(valueSelector(this.collection[len]));
            }
        }
        return min;
    },

    ForEach: function (action) {
        for (var i = 0; i < this.collection.length; i++) {
            action(i, this.collection[i]);
        }
    },

    Max: function (valueSelector) {
        var len = this.collection.length;
        var max = -Infinity;

        while (len--) {
            if (Number(valueSelector(this.collection[len])) > max) {
                max = Number(valueSelector(this.collection[len]));
            }
        }
        return max;
    },

    Partition: function(partitionBy) {
        var resultA = [];
        var resultB = [];
        this.ForEach(function(i,v) {
            if (partitionBy(v)) {
                resultA.push(v);
            } else {
                resultB.push(v);
            }
        });
        this.collection = [resultA, resultB];
        return this;
    },

    Skip: function (times) {
        return this.collection.slice(times);
    }
};

/* Static methods not referring to the internal collection */
Collections.Do = function (times, action) {
    if (typeof action !== 'function') {
        throw new Error('The predicate must be passed a function that returns a boolean');
    }
    for (var i = 0; i < times; i++) {
        action();
    }
};

Collections.Range = function (min, max, step) {
    step = step === undefined ? 1 : step;
    var array = [];
    for (var i = min; i <= max; i += step) {
        array.push(i);
    }
    return array;
};
Collections.Remove = function (array, itm) {
    var index = array.indexOf(itm);
    array.splice(index);

    return array;
};

Collections.Zip = function (arrayA, arrayB) {
    if (arrayA.length !== arrayB.length) {
        throw new Error("Arrays are not the same size");
    } else {
        var result = [];
        for (var i = 0; i < arrayA.length; i++) {
            result.push([arrayA[i], arrayB[i]]);
        }
        return result;
    }
};

function Collections2(array) {
    this.collection = array;
    this.evaluationStack = [];
}

Collections2.ToCollection = function(array){
    return new Collections2(array);
};

Collections2.prototype = {
    Collect: function () {
        var result = this.collection
        for(var i = 0; i < this.evaluationStack.length; i++){
            result = this.evaluationStack[i](result);
        }
        return result;
    },

    Where: function (predicate) {
        this.evaluationStack.push(function(result) {
            var results = [];
            for (var i = 0; i < result.length; i++) {
                if (predicate(result[i])) {
                    results.push(result[i]);
                }
            }
            return results;
        });
        return this;
    },

    SelectIndex:  function (valueSelector) {
        this.evaluationStack.push(function(result) {
            var results = [];
            for (var i = 0; i < result.length; i++) {
                results.push(valueSelector(i, result[i]));
            }
            return results;
        });
        return this;
    },

    GroupBy: function (keyFunction) {
        this.evaluationStack.push(function(result){
            var groups = {};
            for (var i = 0; i < result.length; i++) {
                var key = keyFunction(result[i]);
                if (key in groups === false) {
                    groups[key] = [];
                }
                groups[key].push(result[i]);
            }
            this.collection = Object.keys(groups).map(function (key) {
                return {
                    key: key,
                    values: groups[key]
                };
            });
        });
        return this;
    },

    Flatten:  function() {
        this.evaluationStack.push(function(result) {
            function flatten(collection) {
                return collection.reduce(function(a,b){
                    if(Array.isArray(b)) {
                        return a.concat(flatten(b))
                    }
                    return a.concat(b);
                }, [])
            }
            return flatten(result);
        });
        return this;
    },

    Partition: function(partitionBy) {
        this.evaluationStack.push(function(result) {
            var resultA = [];
            var resultB = [];
            for(var i = 0; i < result.length; i++) {
                if (partitionBy(result[i])) {
                    resultA.push(result[i]);
                } else {
                    resultB.push(result[i]);
                }
            }
            return [resultA, resultB];
        });
        return this;
    },
};

var x = Collections2.ToCollection([1,2,44,2,3,8])
    .Where(function(f) {
        return (f % 2) === 0;
    }).Where(function (f) {
        return f === 44;
    });
console.log(x);




