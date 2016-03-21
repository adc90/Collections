Array.prototype.ToCollection = function() {
    return new Collections(this);
}

function Collections(array) {
    this.collection = array;
};

Collections.prototype.Collect = function() {
    return this.collection;
};

Collections.prototype.Where = function(predicate) {
    var results = [];
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            results.push(this.collection[i]);
        }
    }
    this.collection = results;
    return this;
};

Collection.prototype.First = function (predicate) {
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            return this.collection[i];
        }
    }
};

Collection.prototype.Count = function(predicate) {
    var cnt = 0;
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            cnt++;
        }
    }
    return cnt;
};

Collection.prototype.All = function(predicate) {
    for (var i = 0; i < this.collection.length; i++) {
        if (!predicate(this.collection[i])) {
            return false;
        }
    }
    return true;
};

Collection.prototype.Any = function (predicate) {
    for (var i = 0; i < this.collection.length; i++) {
        if (predicate(this.collection[i])) {
            return true;
        }
    }
    return false;
};    

Collection.prototype.GroupBy = function (keyFunction) {
    var groups = {};
    for (var i = 0; i < this.collection.length; i++) {
        var key = keyFunction(this.collection[i]);
        if (key in groups == false) {
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

Collection.prototype.OrderBy = function (array, orderSelector) {

};

Collection.prototype.OrderByDescending = function (array, orderSelector) {

};

Collection.prototype.Join = function (collection2, compareFunction) {

};

Collection.prototype.Without = function (predicate) {
    var result = [];
    for (var i = 0; i < this.collection.length; i++) {
        if (!predicate(this.collection[i])) {
            result.push(this.collection[i]);
        }
    }
    this.collection = result;
    return this;
};

Collection.prototype.Distinct = function (valueSelector) {
    var result = [];

    return this;
};

collection.Sum = function (valueSelector) {
    var sum = 0;
    for (var i = 0; i < this.collection.length; i++) {
        sum += valueSelector(this.collection[i]);
    }
    return sum;
};

Collection.prototype.Do = function (times, action) {
    if (typeof action !== 'function') {
        throw new Error('The predicate must be passed a function that returns a boolean');
    }
    for (var i = 0; i < times; i++) {
        action();
    }
};

Collection.prototype.Range = function (min, max, step) {
    step = step === undefined ? 1 : step;
    var array = [];
    for (var i = min; i <= max; i += step) {
        array.push(i);
    }
    return array;
};

Collection.prototype.Min = function (valueSelector) {
    var len = this.collection.length;
    var min = Infinity;

    while (len--) {
        if (Number(valueSelector(this.collection[len])) < min) {
            min = Number(valueSelector(this.collection[len]));
        }
    }
    return min;
};

Collection.prototype.Max = function(valueSelector) {
    var len = this.collection.length;
    var max = -Infinity;
    while (len--) {
        if (Number(valueSelector(this.collection[len])) > max) {
            max = Number(valueSelector(this.collection[len]));
        }
    }
    return max;
};