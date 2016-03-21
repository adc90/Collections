var collections2 = function() {
    var self = this;

    var collection = function() { };
    var internalCollection = [];

    collection.ToCollection = function(array) {
        internalCollection = array;
    };

    collection.Collect = function () {
        return internalCollection;
    };

    collection.Where = function (predicate) {
        var results = [];
        for (var i = 0; i < internalCollection.length; i++) {
            if (predicate(internalCollection[i])) {
                results.push(internalCollection[i]);
            }
        }
        internalCollection = results;
        return self;
    }

    return collection;
}
