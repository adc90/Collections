var collections = function () {

    var self = this;
    var collection = function () {
    };

    var internalCollection = [];

    collection.ToCollection = function (array) {
        internalCollection = array;
    };

    collection.Collect = function () {
        return internalCollection;
    };

    collection.where = function (predicate) {
        var results = [];
        for (var i = 0; i < internalCollection.length; i++) {
            if (predicate(internalCollection[i])) {
                results.push(internalCollection[i]);
            }
        }
        internalCollection = results;
        return self;
    }

    collection.First = function (predicate) {
        for (var i = 0; i < internalCollection.length; i++) {
            if (predicate(internalCollection[i])) {
                internalCollection = internalCollection[i];
                return;
            }
        }
        return self;
    };

    collection.Count = function (array, predicate) {
        argumentCheck(array, predicate);
        var cnt = 0;
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                cnt++;
            }
        }
        return cnt;
    }

    collection.All = function (array, predicate) {
        argumentCheck(array, predicate);
        for (var i = 0; i < array.length; i++) {
            if (!predicate(array[i])) {
                return false;
            }
        }
        return true;
    };

    collection.Any = function (array, predicate) {
        argumentCheck(array, predicate);
        for (var i = 0; i < array.length; i++) {
            if (predicate(array[i])) {
                return true;
            }
        }
        return false;
    };
    
    //http://stackoverflow.com/a/31081420
    collection.GroupBy = function (keyFunction) {
        var groups = {};
        for (var i = 0; i < internalCollection.length; i++) {
            var key = keyFunction(internalCollection[i]);
            if (key in groups == false) {
                groups[key] = [];
            }
            groups[key].push(internalCollection[i]);

        }
        internalCollection = Object.keys(groups).map(function(key) {
           return {
                key: key,
                values: groups[key]
            };
        });
        return self;
    };

    collection.OrderBy = function (array, orderSelector) {

    };

    collection.OrderByDescending = function (array, orderSelector) {

    };

    collection.Join = function (array1, array2, compareFunction) {

    };

    collection.Without = function (predicate) {
        var result = [];
        for (var i = 0; i < internalCollection.length; i++) {
            if (!predicate(internalCollection[i])) {
                result.push(internalCollection[i]);
            }
        }
        internalCollection = result;
        return self;
    };

    collection.Distinct = function (array, valueSelector) {
        argumentCheck(array, valueSelector);
        var result = [];
        for (var i = 0; i < array.length; i++) {
            var tmp1 = valueSelector(array[i]);
            for (var j = 0; j < result.length; j++) {
                var tmp2 = valueSelector(result[j]);
                if (tmp1 == tmp2)
                    break;
                else
                    result.push(result[j]);
            }
        }
        return result;
    };

    collection.Sum = function (array, valueSelector) {
        argumentCheck(array, valueSelector);
        var sum = 0;
        for (var i = 0; i < array.length; i++) {
            sum += valueSelector(array[i]);
        }
        return sum;
    };

    collection.Do = function (times, action) {
        if (typeof action !== 'function') {
            throw new Error('The predicate must be passed a function that returns a boolean');
        }
        for (var i = 0; i < times; i++) {
            action();
        }
    };

    collection.Range = function (min, max, step) {
        step = step === undefined ? 1 : step;
        var array = [];
        for (var i = min; i <= max; i += step) {
            array.push(i);
        }
        return array;
    };

    collection.Min = function (array, valueSelector) {
        argumentCheck(array, valueSelector);
        var len = array.length; 
        var min = Infinity;

        while (len--) {
            if (Number(valueSelector(array[len])) < min) {
                min = Number(valueSelector(array[len]));
            }
        }
        return min;
    };

    collection.Max = function (array, valueSelector) {
        var len = array.length; 
        var max = -Infinity;
        while (len--) {
            if (Number(valueSelector(array[len])) > max) {
                max = Number(valueSelector(array[len]));
            }
        }
        return max;
    };

    var argumentCheck = function (array, predicate) {
        if (typeof predicate !== 'function') {
            throw new Error('The predicate must be passed a function that returns a boolean');
        }
        if (!(array instanceof Array)) {
            throw new Error('The array must be of type array');
        }
    };

    return collection;
}

