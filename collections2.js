/**
 * Created by adc90 on 12/11/2016.
 */

/*
 * Constructor for the collections
 */
var Collections = (function() {

    function CollectionsUtil() {
        this.thenBy = [];
    }

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

    CollectionsUtil.prototype.buildOrderedFunction = function() {

    };

    /* Collections constructor function */
    function Collections(array) {
        var evalStack = [];
        var collection = array;

        this.pushToEvalStack = function(funcNm, func) {
            evalStack.push({
                FuncName: funcNm,
                Func: func
            });
        };

        this.orderedCollection = new OrderedCollections(this);

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
                result = evalStack[i]['Func'](result);
            }
            return result;
        },

        Difference: function(rightCollection, comparisonFunction){
            throw new Error("Not implemented exception");
        },

        Intersection: function(rightCollection, comparisonFunction) {
            this.pushToEvalStack('Intersection', function(input){
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
            this.pushToEvalStack('PullAt', function(input) {
                var result = [];
                for(var i = 0; i < input.length; i++) {
                    result.push(input[array[i]]);
                }
                return result;
            });
            return this;
        },

        Where: function (predicate) {
            this.pushToEvalStack('Where', function(input) {
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
            this.pushToEvalStack('Reduce', function(input){
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
            this.pushToEvalStack('Select', function(input) {
                var result = [];
                for (var i = 0; i < input.length; i++) {
                    result.push(valueSelector(i, input[i]));
                }
                return result;
            });
            return this;
        },

        GroupBy: function (keyFunction) {
            this.pushToEvalStack('GroupBy', function(input){
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
            this.pushToEvalStack('Flatten', function(input) {
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
            this.pushToEvalStack('Partition', function(input) {
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
            this.pushToEvalStack('Join', function(input) {
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
            this.pushToEvalStack('Reverse', function(input) {
                var result = [];
                for (var i = input.length - 1; i > -1; i--) {
                    result.push(input[i]);
                }
                return result;
            });

            return this;
        },

        Without: function (predicate) {
            this.pushToEvalStack('Without', function(input) {
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
            this.pushToEvalStack('Distinct', function(input) {
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

        Union: function(rightCollection, valueSelector) {
            this.pushToEvalStack('Union', function(input) {
                var result = input.concat(rightCollection);
                this.Distinct(valueSelector);
            });
            return this;
        },

        TakeWhile:  function (predicate) {
            this.pushToEvalStack('TakeWhile', function(input) {
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

        OrderBy: function (orderSelector, comparisonFunc) {

            return this.orderedCollection;
        },

        OrderByDescending:  function (orderSelector, comparisonFunc) {

            return this.orderedCollection;
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

        //Skip: function (times) {
        //    return this.Collect().slice(times);
        //},

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

    function OrderedCollections(collections) {
        var collection = collections;
        this.getCollection = function()  {
            return collections;
        };

        this.pushToEvalStack = function (funcNm, func) {
            collection.pushToEvalStack(funcNm, func);
        };

        this.collections = collections;
    }

    OrderedCollections.prototype = {

        Collect:  function () {
            return this.getCollection().Collect();
        },

        ThenBy: function(valueSelector) {

            return this;
        },

        ThenByDesc: function(valueSelector) {

            return this;
        },

        Difference: function(rightCollection, comparisonFunction){
            this.getCollection().Difference(rightCollection, comparisonFunction);
            return this.getCollection();
        },

        Intersection: function(rightCollection, comparisonFunction) {
            this.getCollection().Intersection(rightCollection, comparisonFunction);
            return this.getCollection();
        },

        PullAt: function(array) {
            this.getCollection().PullAt(array);
            return this.getCollection();
        },

        Where: function (predicate) {
            this.getCollection().Where(predicate);
            return this.getCollection();
        },

        Reduce: function (reductionFunction) {
            this.getCollection().Reduce(reductionFunction);
            return this.getCollection();
        },

        Select: function (valueSelector) {
            this.getCollection().Select(valueSelector);
            return this.getCollection();
        },

        GroupBy: function (keyFunction) {
            this.getCollection().GroupBy(keyFunction);
            return this.getCollection();
        },

        Flatten: function() {
            this.getCollection().Flatten();
            return this.getCollection();
        },

        Partition: function(partitionBy) {
            this.getCollection().Partition(partitionBy);
            return this.getCollection();
        },

        Join: function (rightCollection, leftKey, rightKey, selectedResult) {
            this.getCollection().Join(rightCollection, leftKey, rightKey, selectedResult);
            return this.getCollection();
        },

        Reverse:  function() {
            this.getCollection().Reverse();
            return this.getCollection();
        },

        Without: function (predicate) {
            this.getCollection().Without(predicate);
            return this.getCollection();
        },

        Distinct: function (comparisonFunction) {
            this.getCollection().Distinct(comparisonFunction);
            return this.getCollection();
        },

        First: function (predicate) {
            return this.getCollection().First(predicate);
        },

        Last: function(predicate) {
            return this.getCollection().Last(predicate);
        },

        Contains:  function (item) {
            return this.getCollection().Contains(item);
        },

        Count: function (predicate) {
            return this.getCollection().Contains(predicate);
        },

        All: function (predicate) {
            return this.getCollection().All(predicate);
        },

        Any: function (predicate) {
            return this.getCollection().Any(predicate)
        },

        ToDictionary: function(keySelector, valueSelector) {
            return this.getCollection().ToDictionary(keySelector, valueSelector);
        },

        TakeWhile:  function (predicate) {
            this.getCollection().TakeWhile(predicate);
            return this.getCollection();
        },

        //TODO: Needs to be evaluated to be lazy
        //Skip: function (times) {
        //    return this.Collect().slice(times);
        //},

        Union: function(rightCollection, valueSelector) {
            this.getCollection().Union(rightCollection, valueSelector);
            return this.getCollection();
        },

        Min: function (valueSelector) {
            this.getCollection().Min(valueSelector);
            return this.getCollection();

        },

        Max: function (valueSelector) {
            this.getCollection().Max(valueSelector);
            return this.getCollection();
        },

        Average: function(valueSelector) {
            return this.Average(valueSelector);
        },

        Sum:  function (valueSelector) {
            return this.Sum(valueSelector);
        },

        ForEach: function (action) {
            this.getCollection().ForEach(action)
        }
    };

    return Collections;
})();

module.exports = Collections;

