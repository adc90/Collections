/**
 * Created by adc90 on 12/11/2016.
 */

/*
 * Constructor for the collections
 */
var Collections = (function() {

    function EvalStackElement(funcNm, func) {
        this.FuncName = funcNm;
        this.Func = func;
    }

    function OrderByElement(funcNm, orderSelector, comparisonFunc) {
        this.FuncName = funcNm;
        this.OrderSelector = orderSelector;
        this.ComparisonFunction = comparisonFunc;
    }

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

    CollectionsUtil.prototype.identityFunction = function(v) {
        return v;
    };

    CollectionsUtil.prototype.getComparisonFunction = function(comparisonFunc) {
        return typeof comparisonFunc === "function" ? comparisonFunc : this._utilities.compareTo;
    };

    CollectionsUtil.prototype.compareTo = function(a, b, orderNum, thenBy) {
        return a > b ? (1 * orderNum) : (a < b ? (-1 * orderNum) : thenBy);
    };

    CollectionsUtil.prototype.buildOrderedFunction = function(orderStack){
        var comparisonFunc = this.compareTo;
        orderStack = orderStack.reverse();

        var orderNum = 1;
        for(var i = 0; i < orderStack.length; i++) {
            var tmp = orderStack[i];
            var orderNum = tmp.FuncName === "OrderByDesc" || tmp.FuncName === "ThenByDesc" ? - 1 : 1;

            if(i === 0) {
                comparisonFunc = function(a,b) {
                   return this.compareTo(tmp.OrderSelector(a), tmp.OrderSelector(b), orderNum, this.identityFunction(0));
                }.bind(this);
            } else {
                comparisonFunc = function(a,b) {
                    return this.compareTo(tmp.OrderSelector(a), tmp.OrderSelector(b), orderNum, comparisonFunc);
                }.bind(this);

            }
            console.log(comparisonFunc);
        }

        return new EvalStackElement('OrderFunc', function(input) {
            input.sort(function (a, b) {
                comparisonFunc(a, b);
            });
        });
    };

    /* Collections constructor function */
    function Collections(array) {
        var evalStack = [];
        var collection = array;

        var orderByFlag = false;
        var orderByStack = [];

        this._pushToEvalStack = function(elem) {
            if(elem instanceof EvalStackElement) {
                if(orderByFlag) {
                    orderByFlag = false;
                    evalStack.push(this._utilities.buildOrderedFunction(orderByStack));
                }
                evalStack.push(elem);
            } else if(elem instanceof OrderByElement) {
                orderByFlag = true;
                orderByStack.push(elem);
            } else if(elem === 'Collect') {
                evalStack.push(this._utilities.buildOrderedFunction(orderByStack));
            } else {
                throw new Error();
            }
        };

        this._getEvalStack = function() {
            return evalStack;
        };

        this._getCollection = function() {
            return collection;
        };

        this._utilities = new CollectionsUtil();
        this._orderedCollection = new OrderedCollections(this);
    }


    Collections.prototype = {

        Collect: function () {
            var result = this._getCollection();
            var evalStack = this._getEvalStack();

            this._pushToEvalStack('Collect');

            for(var i = 0; i < evalStack.length; i++){
                result = evalStack[i]['Func'](result);
            }
            return result;
        },

        Difference: function(rightCollection, comparisonFunction){
            throw new Error("Not implemented exception");
        },

        Intersection: function(rightCollection, comparisonFunction) {
            this._pushToEvalStack(new EvalStackElement('Intersection', function(input){
                var result = [];
                var compareTo = function(a,b) {
                    return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                        ? comparisonFunction(a) === comparisonFunction(b)
                        : this._utilities.isEqual(a,b);
                }.bind(this);

                for(var i = 0; i < input.length; i++){
                    for(var j = 0; j < rightCollection.length; j++){
                        if(compareTo(input[i]), rightCollection[j]) {
                            result.push(input[i]);
                        }
                    }
                }
                return result;
            }));

            return this;
        },

        PullAt: function(array) {
            this._pushToEvalStack(new EvalStackElement('PullAt', function(input) {
                var result = [];
                for(var i = 0; i < input.length; i++) {
                    result.push(input[array[i]]);
                }
                return result;
            }));

            return this;
        },

        Where: function (predicate) {
            this._pushToEvalStack(new EvalStackElement('Where', function(input) {
                var result = [];
                for (var i = 0; i < input.length; i++) {
                    if (predicate(input[i])) {
                        result.push(input[i]);
                    }
                }
                return result;
            }));

            return this;
        },

        Reduce: function (reductionFunction) {
            this._pushToEvalStack(new EvalStackElement('Reduce', function(input){
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
            }));

            return this;
        },

        Select: function (valueSelector) {
            this._pushToEvalStack(new EvalStackElement('Select', function(input) {
                var result = [];
                for (var i = 0; i < input.length; i++) {
                    result.push(valueSelector(i, input[i]));
                }
                return result;
            }));

            return this;
        },

        GroupBy: function (keyFunction) {
            this._pushToEvalStack(new EvalStackElement('GroupBy', function(input){
                var groups = {};
                for (var i = 0; i < input.length; i++) {
                    var key = keyFunction(input[i]);
                    if (key in groups === false) {
                        groups[key] = [];
                    }
                    groups[key].push(input[i]);
                }
                return Object.keys(groups).map(function (key) {
                    return {
                        key: key,
                        values: groups[key]
                    };
                });
            }));

            return this;
        },

        Flatten: function() {
            this._pushToEvalStack(new EvalStackElement('Flatten', function(input) {
                function flatten(collection) {
                    return collection.reduce(function(a,b){
                        if(Array.isArray(b)) {
                            return a.concat(flatten(b))
                        }
                        return a.concat(b);
                    }, [])
                }
                return flatten(input);
            }));

            return this;
        },

        Partition: function(partitionBy) {
            this._pushToEvalStack(new EvalStackElement('Partition', function(input) {
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
            }));

            return this;
        },

        Join: function (rightCollection, leftKey, rightKey, selectedResult) {
            this._pushToEvalStack(new EvalStackElement('Join', function(input) {
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
            }));

            return this;
        },

        Reverse: function() {
            this._pushToEvalStack(new EvalStackElement('Reverse', function(input) {
                var result = [];
                for (var i = input.length - 1; i > -1; i--) {
                    result.push(input[i]);
                }
                return result;
            }));

            return this;
        },

        Without: function (predicate) {
            this._pushToEvalStack(new EvalStackElement('Without', function(input) {
                var result = [];
                for (var i = 0; i < input.length; i++) {
                    if (!predicate(input[i])) {
                        result.push(input[i]);
                    }
                }
                return result;
            }));

            return this;
        },

        Distinct: function (comparisonFunction) {
            this._pushToEvalStack(new EvalStackElement('Distinct', function(input) {
                var result = [];
                //If were're supplied with a value selector function we'll use that to compare the values.
                //Otherwise we'll use the default deep compare as supplied by the _utilities class in this library
                var compareTo = function (a, b) {
                    return (comparisonFunction !== undefined && typeof comparisonFunction === "function")
                        ? comparisonFunction(a) === comparisonFunction(b)
                        : this._utilities.isEqual(a, b);
                }.bind(this);

                function exists(results, item) {
                    for (var i = 0; i < result.length; i++) {
                        if (compareTo(result[i], item))
                            return true;
                    }
                    return false;
                }

                for (var i = 0; i < input.length; i++) {
                    if (!exists(result, input[i])) {
                        result.push(input[i]);
                    }
                }
                return result;
            }));

            return this;
        },

        Union: function(rightCollection, valueSelector) {
            this._pushToEvalStack(new EvalStackElement('Union', function(input) {
                var result = input.concat(rightCollection);
                this.Distinct(valueSelector);
            }));

            return this;
        },

        TakeWhile:  function (predicate) {
            this._pushToEvalStack(new EvalStackElement('TakeWhile', function(input) {
                var result = [];

                for (var i = 0; i < input.length; i++) {
                    if (predicate(input[i])) {
                        result.push(input[i]);
                    } else {
                        break;
                    }
                }
                return result;
            }));

            return this;
        },

        OrderBy: function (orderSelector, comparisonFunc) {
            this._pushToEvalStack(new OrderByElement('OrderBy', orderSelector, comparisonFunc));

            return this._orderedCollection;
        },

        OrderByDesc:  function (orderSelector, comparisonFunc) {
            this._pushToEvalStack(new OrderByElement('OrderByDesc', orderSelector, comparisonFunc));

            return this._orderedCollection;
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
            var result = this.Collect();
            if (valueSelector === undefined) {
                valueSelector = this._utilities.identityFunction;
            }

            var sum = 0;
            for (var i = 0; i < result.length; i++) {
                sum += valueSelector(result[i]);
            }
            return sum / result.length;
        },

        Sum:  function (valueSelector) {
            var result = this.Collect();
            if (valueSelector === undefined) {
                valueSelector = this._utilities.identityFunction;
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

    function OrderedCollections(collections) {
        var collection = collections;
        this._getCollection = function()  {
            return collections;
        };

        this._pushToEvalStack = function (funcNm, func) {
            collection._pushToEvalStack(funcNm, func);
        };

        this.collections = collections;
    }

    OrderedCollections.prototype = {

        Collect:  function () {
            return this._getCollection().Collect();
        },

        ThenBy: function (orderSelector, comparisonFunc) {
            this._pushToEvalStack(new OrderByElement('ThenBy', orderSelector, comparisonFunc));

            return this;
        },

        ThenByDesc: function (orderSelector, comparisonFunc) {
            this._pushToEvalStack(new OrderByElement('ThenByDesc', orderSelector, comparisonFunc));

            return this;
        },

        Difference: function(rightCollection, comparisonFunction){
            this._getCollection().Difference(rightCollection, comparisonFunction);
            return this._getCollection();
        },

        Intersection: function(rightCollection, comparisonFunction) {
            this._getCollection().Intersection(rightCollection, comparisonFunction);
            return this._getCollection();
        },

        PullAt: function(array) {
            this._getCollection().PullAt(array);
            return this._getCollection();
        },

        Where: function (predicate) {
            this._getCollection().Where(predicate);
            return this._getCollection();
        },

        Reduce: function (reductionFunction) {
            this._getCollection().Reduce(reductionFunction);
            return this._getCollection();
        },

        Select: function (valueSelector) {
            this._getCollection().Select(valueSelector);
            return this._getCollection();
        },

        GroupBy: function (keyFunction) {
            this._getCollection().GroupBy(keyFunction);
            return this._getCollection();
        },

        Flatten: function() {
            this._getCollection().Flatten();
            return this._getCollection();
        },

        Partition: function(partitionBy) {
            this._getCollection().Partition(partitionBy);
            return this._getCollection();
        },

        Join: function (rightCollection, leftKey, rightKey, selectedResult) {
            this._getCollection().Join(rightCollection, leftKey, rightKey, selectedResult);
            return this._getCollection();
        },

        Reverse:  function() {
            this._getCollection().Reverse();
            return this._getCollection();
        },

        Without: function (predicate) {
            this._getCollection().Without(predicate);
            return this._getCollection();
        },

        Distinct: function (comparisonFunction) {
            this._getCollection().Distinct(comparisonFunction);
            return this._getCollection();
        },

        First: function (predicate) {
            return this._getCollection().First(predicate);
        },

        Last: function(predicate) {
            return this._getCollection().Last(predicate);
        },

        Contains:  function (item) {
            return this._getCollection().Contains(item);
        },

        Count: function (predicate) {
            return this._getCollection().Contains(predicate);
        },

        All: function (predicate) {
            return this._getCollection().All(predicate);
        },

        Any: function (predicate) {
            return this._getCollection().Any(predicate)
        },

        ToDictionary: function(keySelector, valueSelector) {
            return this._getCollection().ToDictionary(keySelector, valueSelector);
        },

        TakeWhile:  function (predicate) {
            this._getCollection().TakeWhile(predicate);
            return this._getCollection();
        },

        Union: function(rightCollection, valueSelector) {
            this._getCollection().Union(rightCollection, valueSelector);
            return this._getCollection();
        },

        Min: function (valueSelector) {
            this._getCollection().Min(valueSelector);
            return this._getCollection();
        },

        Max: function (valueSelector) {
            this._getCollection().Max(valueSelector);
            return this._getCollection();
        },

        Average: function(valueSelector) {
            return this.Average(valueSelector);
        },

        Sum:  function (valueSelector) {
            return this.Sum(valueSelector);
        },

        ForEach: function (action) {
            this._getCollection().ForEach(action)
        }
    };

    return Collections;
})();

module.exports = Collections;

