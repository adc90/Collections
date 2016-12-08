console.log('test');

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

function Dictionary() {
    var _dictList = [];

    function KeyValuePair(key, value) {
        if (typeof key !== "string" && typeof key !== "number") {
            throw new TypeError("key must be of type string or number");
        }
        this.Key = key;
        this.Value = value;
    }

    var iterateList = function (prop) {
        var result = [];
        for (var i = 0; i < _dictList.length; i++) {
            result.push(_dictList[i][prop]);
        }
        return result;
    };

    this.Count = function () {
        return _dictList.length;
    };

    this.Keys = function () {
        return iterateList("Key");
    };

    this.Values = function () {
        return iterateList("Value");
    };

    this.Add = function (key, value) {
        for (var i = 0; i < _dictList.length; i++) {
            if (key === _dictList[i].Key) {
                throw new Error("Dictionary already contains the key: " + key);
            }
        }
        _dictList.push(new KeyValuePair(key, value));
    };

    this.Remove = function (key) {
        var foundIdx = -1;
        for (var i = 0; i < _dictList.length; i++) {
            if (key === _dictList[i].Key) {
                foundIdx = i;
                break;
            }
        }
        if (foundIdx === -1) {
            throw new Error("Dictionary does not contain the key: " + key);
        }
        _dictList.splice(foundIdx, 1);
    };

    this.GetItem = function (key) {
        var foundIdx = -1;
        for (var i = 0; i < _dictList.length; i++) {
            if (key === _dictList[i].Key) {
                foundIdx = i;
                break;
            }
        }
        if (foundIdx === -1) {
            throw new Error("Dictionary does not contain the key: " + key);
        }
        return _dictList[foundIdx];
    };

    this.Clear = function () {
        _dictList = [];
    };
}

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

Collections.prototype.Collect = function () {
    return this.collection;
};

Collections.prototype.Difference = function(rightCollection, comparisonFunction){
    throw new Error("Not implemented exception");
};

Collections.prototype.Intersection = function(rightCollection, comparisonFunction) {
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
};

Collections.prototype.PullAt = function(array) {
    var result = [];
    for(var i = 0; i < array.length; i++) {
        result.push(this.collection[array[i]]);
    }
    this.collection = result;

    return this;
};

Collections.prototype.Where = function (predicate) {
    var results = [];
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            results.push(this.collection[i]);
        }
    }
    this.collection = results;
    return this;
};

Collections.prototype.First = function (predicate) {
    if (predicate === undefined) {
        return this.collection[0];
    }
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            return this.collection[i];
        }
    }
    return null;
};

Collections.prototype.Last = function(predicate) {
    if (predicate === undefined) {
        return this.collection[this.collection.length - 1];
    }
    for(var i = this.collection.length; i > 0; i--) {
        if (predicate(this.collection[i])) {
            return this.collection[i];
        }
    }
};

Collections.prototype.Reduce = function (reductionFunction) {
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
};

Collections.prototype.ToDictionary = function(keySelector, valueSelector) {
    var dictionary = new Dictionary();
    this.ForEach(function(i, v) {
        dictionary.Add(keySelector(v), valueSelector(v));
    });
    return dictionary;
};

Collections.prototype.Contains = function (item) {
    for (var i = 0; i < this.collection.length; i++) {
        if (this.collection[i] === item) {
            return true;
        }
    }
    return false;
};

//JavaScript's map does the same thing more or less
Collections.prototype.Select = function (valueSelector) {
    var result = [];
    for (var i = 0; i < this.collection.length; i++) {
        result.push(valueSelector(this.collection[i]));
    }
    this.collection = result;
    return this;
};

Collections.prototype.Average = function(valueSelector) {
    var length = this.collection.length;
    var sum = this.Sum(valueSelector);

    return sum / length;
};

//This could be used along with the first, but I always forget to so that, so rather than refactor there is two methods
Collections.prototype.SelectIndex = function (valueSelector) {
    var result = [];
    for (var i = 0; i < this.collection.length; i++) {
        result.push(valueSelector(i, this.collection[i]));
    }
    this.collection = result;
    return this;
};

Collections.prototype.Pluck = function(items) {
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
};

Collections.prototype.Count = function (predicate) {
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
};

Collections.prototype.All = function (predicate) {
    for (var i = 0; i < this.collection.length; i++) {
        if (!predicate(this.collection[i])) {
            return false;
        }
    }
    return true;
};

Collections.prototype.Flatten = function() {

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
};

Collections.prototype.Any = function (predicate) {
    if (predicate === undefined) {
        return this.collection.length > 0;
    }
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            return true;
        }
    }
    return false;
};

Collections.prototype.GroupBy = function (keyFunction) {
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
};

Collections.prototype.OrderBy = function (orderSelector, comparisonFunc) {
    var compareTo = typeof comparisonFunc === "function" ? comparisonFunc : this.utilities.compareTo;

    this.collection.sort(function (a, b) {
        return compareTo(orderSelector(a),orderSelector(b));
    }.bind(this));

    return this;
};

Collections.prototype.OrderByDescending = function (orderSelector, comparisonFunc) {
    var compareTo = typeof comparisonFunc === "function" ? comparisonFunc : this.utilities.compareTo;

    this.collection = this.collection.sort(function (a, b) {
        return compareTo(orderSelector(b),orderSelector(a));
    }.bind(this));

    return this;
};

Collections.prototype.Join = function (rightCollection, leftKey, rightKey, selectedResult) {
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
};

Collections.prototype.Reverse = function() {
    var result = [];
    for (var i = this.collection.length - 1; i > -1; i--) {
        result.push(this.collection[i]);
    }
    this.collection = result;

    return this;
};

Collections.prototype.Without = function (predicate) {
    var result = [];
    for (var i = 0; i < this.collection.length; i++) {
        if (!predicate(this.collection[i])) {
            result.push(this.collection[i]);
        }
    }
    this.collection = result;
    return this;
};

Collections.prototype.TakeWhile = function (predicate) {
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
};

Collections.prototype.Union = function(rightCollection, valueSelector) {
    this.collection = this.collection.concat(rightCollection);
    this.Distinct(valueSelector);

    return this;
};

Collections.prototype.Distinct = function (comparisonFunction) {
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
};

Collections.prototype.Sum = function (valueSelector) {
    //Default argument
    if (valueSelector === undefined) {
        valueSelector = this.utilities.identityFunction;
    }

    var sum = 0;
    for (var i = 0; i < this.collection.length; i++) {
        sum += valueSelector(this.collection[i]);
    }
    return sum;
};

Collections.prototype.Min = function (valueSelector) {
    var len = this.collection.length;
    var min = Infinity;

    while (len--) {
        if (Number(valueSelector(this.collection[len])) < min) {
            min = Number(valueSelector(this.collection[len]));
        }
    }
    return min;
};

Collections.prototype.ForEach = function (action) {
    for (var i = 0; i < this.collection.length; i++) {
        action(i, this.collection[i]);
    }
};

Collections.prototype.Max = function (valueSelector) {
    var len = this.collection.length;
    var max = -Infinity;
    while (len--) {
        if (Number(valueSelector(this.collection[len])) > max) {
            max = Number(valueSelector(this.collection[len]));
        }
    }
    return max;
};

Collections.prototype.Partition = function(partitionBy) {
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
};

Collections.prototype.Skip = function (times) {
    return this.collection.slice(times);
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
