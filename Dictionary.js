/**
 * Created by adc90 on 12/11/2016.
 */

function Dictionary() {
    var _dictList = [];

    function KeyValuePair(key, value) {
        if (typeof key !== "string" && typeof key !== "number") {
            throw new TypeError("key must be of type string or number");
        }
        this.Key = key;
        this.Value = value;
    }

    function iterateList (prop) {
        var result = [];
        for (var i = 0; i < _dictList.length; i++) {
            result.push(_dictList[i][prop]);
        }
        return result;
    }

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
