/**
 * Created by adc90 on 12/11/2016.
 */

/*
 * Constructor for the collections
 */

function CollectionsUtil() { }

CollectionsUtil.prototype.isEqual = function(a, b) {
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

CollectionsUtil.prototype.compareTo = function(a, b) {
    return a > b ? 1 : (a < b ? -1 : 0);
};

CollectionsUtil.prototype.identityFunction = function(v) {
    return v;
};


function Collections2(array) {
    var evalStack = [];
    var collection = array;

    this.pushToEvalStack = function(f) {
        evalStack.push(f);
    };

    this.getEvalStack = function() {
        return evalStack;
    };

    this.getCollection = function() {
        return collection;
    };

    this.utilities = new CollectionsUtil();
}

/* Static methods not referring to the internal collection */
Collections2.ToCollection = function (array) {
    return new Collections2(array);
};

Collections2.Do = function (times, action) {
    if (typeof action !== 'function') {
        throw new Error('The predicate must be passed a function that returns a boolean');
    }
    for (var i = 0; i < times; i++) {
        action();
    }
};

Collections2.Range = function (min, max, step) {
    step = step === undefined ? 1 : step;
    var array = [];
    for (var i = min; i <= max; i += step) {
        array.push(i);
    }
    return array;
};

Collections2.Remove = function (array, itm) {
    var index = array.indexOf(itm);
    array.splice(index);

    return array;
};

Collections2.Zip = function (arrayA, arrayB) {
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

Collections2.prototype = {
    Collect:  function () {
        var result = this.getCollection();
        var evalStack = this.getEvalStack();
        for(var i = 0; i < evalStack.length; i++){
            console.log(evalStack[i].name);
            result = evalStack[i](result);
        }
        return result;
    },

    Difference: function(rightCollection, comparisonFunction){
        throw new Error("Not implemented exception");
    },

    Intersection: function(rightCollection, comparisonFunction) {
        this.pushToEvalStack(function(input){
            var result = [];
            var compareTo = function(a,b) {
                return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                    ? comparisonFunction(a) === comparisonFunction(b)
                    : this.utilities.isEqual(a,b);
            }.bind(this);

            for(var i = 0; i < input.length; i++){
                for(var j = 0; j < rightCollection.length; j++){
                    if(compareTo(input[i]), rightCollection[j]) {
                        result.push(input[i]);
                    }
                }
            }
            return result;
        });
        return this;
    },

    PullAt: function(array) {
        this.pushToEvalStack(function(input) {
            var result = [];
            for(var i = 0; i < input.length; i++) {
                result.push(input[array[i]]);
            }
            return result;
        });
        return this;
    },

    Where: function (predicate) {
        this.pushToEvalStack(function Where(input) {
            var result = [];
            for (var i = 0; i < input.length; i++) {
                if (predicate(input[i])) {
                    result.push(input[i]);
                }
            }
            return result;
        });
        return this;
    },

    Reduce: function (reductionFunction) {
        this.pushToEvalStack(function(input){
            var val;
            if(input.length === 1) {
                return input[0];
            } else {
                for(var i = 0; i < input.length; i++){
                    if(i === 0) {
                       val = input[i];
                    } else {
                        val = reductionFunction(val, input[i]);
                    }
                }
            }
            return val;
        });
        return this;
    },

    Select: function (valueSelector) {
        this.pushToEvalStack(function(input) {
            var result = [];
            for (var i = 0; i < input.length; i++) {
                result.push(valueSelector(input[i]));
            }
            return result;
        });
        return this;
    },

    SelectIndex: function (valueSelector) {
        this.pushToEvalStack(function(input) {
            var result = [];
            for (var i = 0; i < input.length; i++) {
                result.push(valueSelector(i, input[i]));
            }
            return result;
        });
        return this;
    },

    GroupBy: function (keyFunction) {
        this.pushToEvalStack(function(input){
            var groups = {};
            for (var i = 0; i < input.length; i++) {
                var key = keyFunction(input[i]);
                if (key in groups === false) {
                    groups[key] = [];
                }
                groups[key].push(input[i]);
            }
            this.collection = Object.keys(groups).map(function (key) {
                return {
                    key: key,
                    values: groups[key]
                };
            });
            return groups;
        });
        return this;
    },

    Flatten: function() {
        this.pushToEvalStack(function(input) {
            function flatten(collection) {
                return collection.reduce(function(a,b){
                    if(Array.isArray(b)) {
                        return a.concat(flatten(b))
                    }
                    return a.concat(b);
                }, [])
            }
            return flatten(input);
        });
        return this;
    },

    Partition: function(partitionBy) {
        this.pushToEvalStack(function(input) {
            var resultA = [];
            var resultB = [];
            for(var i = 0; i < input.length; i++) {
                if (partitionBy(input[i])) {
                    resultA.push(input[i]);
                } else {
                    resultB.push(input[i]);
                }
            }
            return [resultA, resultB];
        });
        return this;
    },


    Join: function (rightCollection, leftKey, rightKey, selectedResult) {
        this.pushToEvalStack(function(input) {
            var result = [];
            var leftIntermediateResult = [];
            var rightIntermediateResult = [];
            for (var i = 0; i < input.length; i++) {
                var lKey = leftKey(input[i]);
                var leftObj = null;
                var rightObj = null;
                for (var j = 0; j < rightCollection.length; j++) {
                    var rKey = rightKey(rightCollection[j]);
                    if (lKey === rKey) {
                        leftObj = {};
                        rightObj = {};
                        for (var lVal in input[i]) {
                            leftObj[lVal] = input[i][lVal];
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
            return result;
        });

        return this;
    },

    Reverse:  function() {
        this.pushToEvalStack(function(input) {
            var result = [];
            for (var i = input.length - 1; i > -1; i--) {
                result.push(input[i]);
            }
            return result;
        });

        return this;
    },

    Without: function (predicate) {
        this.pushToEvalStack(function(input) {
            var result = [];
            for (var i = 0; i < input.length; i++) {
                if (!predicate(input[i])) {
                    result.push(input[i]);
                }
            }
            return result;
        });
        return this;
    },

    Distinct: function (comparisonFunction) {
        this.pushToEvalStack(function(input) {
            var result = [];
            //If were're supplied with a value selector function we'll use that to compare the values.
            //Otherwise we'll use the default deep compare as supplied by the utilities class in this library
            var compareTo = function (a, b) {
                return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                    ? comparisonFunction(a) === comparisonFunction(b)
                    : this.utilities.isEqual(a, b);
            }.bind(this);

            function exists(results, item) {
                var inArray = false;
                for (var i = 0; i < result.length; i++) {
                    if (compareTo(result[i], item))
                        return true;
                }
                return inArray;
            }

            for (var i = 0; i < input.length; i++) {
                if (!exists(result, input[i])) {
                    result.push(input[i]);
                }
            }
            return result;
        });

        return this;
    }

    /*
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

    Average: function(valueSelector) {
        var length = this.collection.length;
        var sum = this.Sum(valueSelector);

        return sum / length;
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

    Skip: function (times) {
        return this.collection.slice(times);
    }
};
     */
};

var x = Collections2.ToCollection([1,2,4,5,6])
    .Where(function(f) {
        return f === 4;
    }).Collect();

console.log(x);
