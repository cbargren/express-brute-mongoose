'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractClientStore = require('express-brute/lib/AbstractClientStore');
var moment = require('moment');

var MongooseStore = function (_AbstractClientStore) {
  _inherits(MongooseStore, _AbstractClientStore);

  function MongooseStore(modelOrCallback, options) {
    _classCallCheck(this, MongooseStore);

    var _this = _possibleConstructorReturn(this, (MongooseStore.__proto__ || Object.getPrototypeOf(MongooseStore)).call(this, modelOrCallback, options));

    _this.options = _extends({}, MongooseStore.defaults, options);
    // TODO: Is there a better way to tell something is a mongoose model?
    if (modelOrCallback.update && modelOrCallback.findOne) {
      _this.model = modelOrCallback;
    } else {
      modelOrCallback(function (model) {
        _this.model = model;
      });
    }
    return _this;
  }

  _createClass(MongooseStore, [{
    key: 'set',
    value: function set(key, value, lifetime, callback) {
      var id = this.options.prefix + key;
      var expires = lifetime ? moment().add(lifetime, 'seconds').toDate() : undefined;

      var ret = this.model.update({
        _id: id
      }, {
        _id: id,
        data: value,
        expires: expires
      }, {
        upsert: true
      }).exec();

      if (callback && typeof callback === 'function') {
        ret.then(function (data) {
          return callback(null, data);
        }, function (err) {
          return callback(err, null);
        });
      }

      return ret;
    }
  }, {
    key: 'get',
    value: function get(key, callback) {
      var _this2 = this;

      var id = this.options.prefix + key;

      var ret = this.model.findOne({ _id: id }).exec().then(function (doc) {
        if (doc && doc.expires < new Date()) {
          return _this2.model.remove({ _id: id }).exec().then(function () {
            return null;
          });
        } else if (doc) {
          var data = doc.data;
          data.lastRequest = new Date(data.lastRequest);
          data.firstRequest = new Date(data.firstRequest);
          return Promise.resolve(data);
        }
        return Promise.resolve(null);
      });

      if (callback && typeof callback === 'function') {
        ret.then(function (data) {
          return callback(null, data);
        }, function (err) {
          return callback(err, null);
        });
      }

      return ret;
    }
  }, {
    key: 'reset',
    value: function reset(key, callback) {
      var id = this.options.prefix + key;

      var ret = this.model.remove({ _id: id }).exec();

      if (callback && typeof callback === 'function') {
        ret.then(function (data) {
          return callback(null, data);
        }, function (err) {
          return callback(err, null);
        });
      }

      return ret;
    }
  }]);

  return MongooseStore;
}(AbstractClientStore);

MongooseStore.defaults = {
  prefix: ''
};

module.exports = MongooseStore;