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


function Collections(array) {
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
Collections.ToCollection = function (array) {
    return new Collections(array);
};

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

Collections.prototype = {
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
    },

    First: function (predicate) {
        if (predicate === undefined) {
            this.Collect()[0];
        }
        var result = this.Collect();
        for (var i = 0; i < result.length; i++) {
            if (predicate(result[i])) {
                return result[i];
            }
        }
        return null;
    },

    Last: function(predicate) {
        var result = this.Collect();
        if (predicate === undefined) {
            return result[result.length - 1];
        }
        for(var i = result.length; i > 0; i--) {
            if (predicate(result[i])) {
                return result[i];
            }
        }
        return null;
    },

    Contains:  function (item) {
        var result = this.Collect();
        for (var i = 0; i < result.length; i++) {
            if (result[i] === item) {
                return true;
            }
        }
        return false;
    },

    Count: function (predicate) {
        var result = this.Collect();
        if (predicate === undefined) {
            return result.length;
        }
        var cnt = 0;
        for (var i = 0; i < result.length; i++) {
            if (predicate(result[i])) {
                cnt++;
            }
        }
        return cnt;
    },

    All: function (predicate) {
        var result = this.Collect();
        for (var i = 0; i < result.length; i++) {
            if (!predicate(result[i])) {
                return false;
            }
        }
        return true;
    },

    Any: function (predicate) {
        var result = this.Collect();
        if (predicate === undefined) {
            return result.length > 0;
        }
        for (var i = 0; i < result.length; i++) {
            if (predicate(result[i])) {
                return true;
            }
        }
        return false;
    },

    ToDictionary: function(keySelector, valueSelector) {
        var result = this.Collect();
        var dictionary = new Dictionary();
        for(var i = 0; i < result.length; i++) {
            dictionary.Add(keySelector(result[i]), valueSelector(result[i]));
        }
        return dictionary;
    },

    TakeWhile:  function (predicate) {
        this.pushToEvalStack(function(input) {
            var result = [];

            for (var i = 0; i < input.length; i++) {
                if (predicate(input[i])) {
                    result.push(input[i]);
                }else{
                    break;
                }
            }
            return result;
        });
        return this;
    },

    //Skip: function (times) {
    //    return this.Collect().slice(times);
    //},

    Union: function(rightCollection, valueSelector) {
        this.pushToEvalStack(function(input) {
            var result = input.concat(rightCollection);
            this.Distinct(valueSelector);
        });
        return this;
    },

    Min: function (valueSelector) {
        var result = this.Collect();
        var len = result.length;
        var min = Infinity;
        while (len--) {
            if (Number(valueSelector(result[len])) < min) {
                min = Number(valueSelector(result[len]));
            }
        }
        return min;
    },

    Max: function (valueSelector) {
        var result = this.Collect();
        var len = result.length;
        var max = -Infinity;

        while (len--) {
            if (Number(valueSelector(result[len])) > max) {
                max = Number(valueSelector(result[len]));
            }
        }
        return max;
    },

    Average: function(valueSelector) {
        var len = this.getCollection().length;

        return (this.Sum(valueSelector) / len);
    },

    Sum:  function (valueSelector) {
        var result = this.Collect();
        if (valueSelector === undefined) {
            valueSelector = this.utilities.identityFunction;
        }

        var sum = 0;
        for (var i = 0; i < result.length; i++) {
            sum += valueSelector(result[i]);
        }
        return sum;
    },

    ForEach: function (action) {
        var result = this.Collect();
        for (var i = 0; i < result.length; i++) {
            action(i, result[i]);
        }
    }
};

OrderedCollections = function(collections) {
    this.collections = collections;
};
OrderedCollections.prototype = {
    ThenBy: function() { },
    ThenByDesc: function() { },

    Collect:  function () {
        return this.collections.Collect();
    },

    Difference: function(rightCollection, comparisonFunction){
        this.collections.Difference(rightCollection, comparisonFunction):
        return this.collections;
    },

    Intersection: function(rightCollection, comparisonFunction) {
        this.collections.Intersection(rightCollection, comparisonFunction):
        return this.collections;
    },

    PullAt: function(array) {
        this.collections.PullAt(array);
        return this.collections;
    },

    Where: function (predicate) {
        this.collections.Where(predicate);
        return this.collections;
    },

    Reduce: function (reductionFunction) {
        this.collections.Reduce(reductionFunction);
        return this.collections;
    },

    Select: function (valueSelector) {
        this.collections.Select(valueSelector);
        return this.collections;
    },

    GroupBy: function (keyFunction) {
        this.collections.GroupBy(keyFunction);
        return this.collections;
    },

    Flatten: function() {
        this.collections.Flatten();
        return this.collections;
    },

    Partition: function(partitionBy) {
        this.collections.Partition(partitionBy);
        return this.collections;
    },


    Join: function (rightCollection, leftKey, rightKey, selectedResult) {
        this.collections.Join(rightCollection, leftKey, rightKey, selectedResult);
        return this.collections;
    },

    Reverse:  function() {
        this.collections.Reverse();
        return this.collections;
    },

    Without: function (predicate) {
        this.collections.Without(predicate);
        return this.collections;
    },

    Distinct: function (comparisonFunction) {
        this.collections.Distinct(comparisonFunction);
        return this.collections;
    },

    First: function (predicate) {
        return this.collections.First(predicate);
    },

    Last: function(predicate) {
        return this.collections.Last(predicate);
    },

    Contains:  function (item) {
        return this.collections.Contains(item);
    },

    Count: function (predicate) {
        return this.collections.Contains(predicate);
    },

    All: function (predicate) {
        return this.collections.All(predicate);
    },

    Any: function (predicate) {
        return this.collections.Any(predicate)
    },

    ToDictionary: function(keySelector, valueSelector) {
        return this.collections.ToDictionary(keySelector, valueSelector);
    },

    TakeWhile:  function (predicate) {
        this.collections.TakeWhile(predicate);
        return this.collections;
    },

    //TODO: Needs to be evaluated to be lazy
    //Skip: function (times) {
    //    return this.Collect().slice(times);
    //},

    Union: function(rightCollection, valueSelector) {
        this.collections.Union(rightCollection, valueSelector);
        return this.collections;
    },

    Min: function (valueSelector) {
        this.collections.Min(valueSelector);
        return this.collections;

    },

    Max: function (valueSelector) {
        this.collections.Max(valueSelector);
        return this.collections;
    },

    Average: function(valueSelector) {
        return this.Average(valueSelector);
    },

    Sum:  function (valueSelector) {
        return this.Sum(valueSelector);
    },

    ForEach: function (action) {
        this.collections.ForEach(action)
    }
};
