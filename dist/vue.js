(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  //重写数组中部分方法

  var oldArrayProto = Array.prototype;

  //newArrayProto.__proto__ = oldArrayProto
  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; //concat slice不会改变原数组

  methods.forEach(function (method) {
    //arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));
      console.log('method', method);

      //对新增的数据进行劫持
      var inserted; //新增的内容
      var ob = this.__ob__;
      switch (method) {
        case 'push':
        case 'unshift':
          //arr.unshift(1,2,3)
          inserted = args;
          break;
        case 'splice':
          //arr,splice(0,1,{a:1},{b:2})
          inserted = args.slice(2);
      }
      if (!inserted) {
        //对新增内容进行观测
        ob.observeArray(inserted);
      }
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      //object.defineProperty只能劫持已经存在的属性($set,$delete)

      // data.__ob__ = this  //给数据加了一个标识 如果数据上有__ob__，则说明这个属性被观测过
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      if (Array.isArray(data)) {
        //重写数组方法,7个变异方法,是可以修改数组本身
        //对数组中对象进行监控

        // data.__proto__ = {  //这样干掉了原本的push，再也无法调用原生的slice，contact等；保留数组原有方法，重写部分方法
        //     push() {
        //         console.log('this is repush')
        //     }
        // }
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }
    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环遍历对象，劫持属性
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        //观测数组
        data.forEach(function (item) {
          observe(item);
        });
      }
    }]);
    return Observer;
  }();
  function defineReactive(target, key, value) {
    observe(value); //递归，对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (value === newValue) return;
        value = newValue;
      }
    });
  }
  function observe(data) {
    //对这个对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }
    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    }
    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;
    if (opts.data) {
      initData(vm);
    }
  }
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      //vm.name
      get: function get() {
        return vm[target][key]; //vm._data.name
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }
  function initData(vm) {
    var data = vm.$options.data;
    //根实例data可以是对象，也可以是函数，组件data只能是函数
    data = typeof data === 'function' ? data.call(this) : data;
    vm._data = data;
    //对数据进行劫持 defineProperty
    observe(data);

    //vm._data 用vm来代理
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
  var startTagClose = /^\s*(\/?)>/;
  //vue3采用的不是正则
  //对模板进行编译处理

  function parseHTML(html) {
    //html最开始肯定是一个<
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用于存放元素的栈
    var currentParent; //指向的是栈中最后一个
    var root;

    //最终转化成一颗抽象语法树
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); //创建一个ast节点
      if (!root) {
        //是否为根节点
        root = node;
      }
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }
      stack.push(node);
      currentParent = node; //栈中最后一个元素的指向
    }

    function chars(text) {
      //文本直接放到当前指向的节点
      text = text.replace(/\s/g, ''); //如果空格超过2就删除2个以上的
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }
    function end(tag) {
      stack.pop(); //弹出最后一个,校验标签
      currentParent = stack[stack.length - 1];
    }
    function advance(n) {
      html = html.substring(n);
    }
    function parseStartTag() {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length);
        //如果不是开始标签的结束，就一直匹配下去
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        }
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      }
      return false;
    }
    while (html) {
      //如果textEnd为0，说明是一个开始标签或者结束标签
      //如果textEnd>0，则说明是文本的结束位置
      var textEnd = html.indexOf('<'); //如果indexof的索引是0，则说明是个标签
      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //开始标签的匹配结果
        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(startTagMatch[1]);
          continue;
        }
      }
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容
        if (text) {
          chars(text);
          advance(text.length); //解析到的文本
        }
      }
    }

    return root;
  }

  function compilerToFunction(template) {
    //1 template转换成ast语法树
    var ast = parseHTML(template);
    //2 生成render方法(返回结果为虚拟dom)
    console.log(ast);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; //将用户的选项挂载到实例上

      //初始化状态
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var ops = vm.$options;
      if (!ops.render) {
        //先进行查找有无render函数
        var template; //没有render看一下是否写了template
        if (!ops.template && el) {
          //没有模板 但是写了el
          template = el.outerHTML;
        } else {
          if (el) {
            template = ops.template; //有模板 有el 则采用模板的内容
          }
        }
        //写了template，就用写了的template
        if (template) {
          var render = compilerToFunction(template);
          ops.render = render;
        }
      }
      ops.render; //最红可以获取render方法
      //script 考前引用的vue.global.js这个编译过程是在浏览器运行的 
      //runtiome是不不包括模板编译的，整个编译是打包的时候通过loader来转义.vue文件，runtime时不可以使用template
    };
  }

  //耦合所有方法
  function Vue(options) {
    //options：用户选项
    this._init(options);
  }
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
