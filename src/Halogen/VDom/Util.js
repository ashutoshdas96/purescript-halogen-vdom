"use strict";

// removeEventListener
// removeAttribute
// removeProperty
// pokeMutMap
// addEventListener
// setAttribute

var R = require('ramda');

exports.unsafeGetAny = function (key, obj) {
  return obj[key];
};

exports.unsafeGetProp = function (key, obj) {
  if (obj.props)
    return obj.props[key];
  else return;
};

exports.unsafeHasAny = function (key, obj) {
  return obj.hasOwnProperty(key);
};

exports.updateProperty = function (key, val, obj) {
  return function () {
    window.updateProperty(obj, {value0: key, value1: val})
  };
};

exports.addProperty = function (key, val, obj) {
  return function () {
    window.addProperty(obj, {value0: key, value1: val})
  };
};

exports.unsafeSetAny = function (key, val, obj) {
  return function () {
    obj[key] = val;
  };
};

exports.unsafeSetProp = function (key, val, obj) {
  return function () {
    obj.props[key] = val;
  };
};

exports.removeProperty = function (key, val, obj) {
  return function () {
    obj.props[key] = val;
    delete obj.props[key];
  };
};

exports.unsafeDeleteAny = function (key, obj) {
  return function () {
    delete obj.props[key];
  };
};

exports.forE = function (a, f) {

  return function () {
    var b = [];
    for (var i = 0; i < a.length; i++) {
      b.push(f(i, a[i])());
    }
    return b;
  };
};

exports.forInE = function (o, f) {
  return function () {
    var ks = Object.keys(o);
    for (var i = 0; i < ks.length; i++) {
      var k = ks[i];
      f(k, o[k])();
    }
  };
};

exports.replicateE = function (n, f) {
  return function () {
    for (var i = 0; i < n; i++) {
      f();
    }
  };
};

exports.diffWithIxE = function (a1, a2, f1, f2, f3) {
  return function () {
    var a3 = [];
    var l1 = a1.length;
    var l2 = a2.length;
    var i  = 0;
    while (1) {
      if (i < l1) {
        if (i < l2) {
          a3.push(f1(i, a1[i], a2[i])());
        } else {
          f2(i, a1[i])();
        }
      } else if (i < l2) {
        a3.push(f3(i, a2[i])());
      } else {
        break;
      }
      i++;
    }
    return a3;
  };
};

exports.strMapWithIxE = function (as, fk, f) {
  return function () {
    var o = {};
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var k = fk(a);
      o[k] = f(k, i, a)();
    }
    return o;
  };
};

exports.diffWithKeyAndIxE = function (o1, as, fk, f1, f2, f3) {
  return function () {
    var o2 = {};
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var k = fk(a);
      if (o1.hasOwnProperty(k)) {
        o2[k] = f1(k, i, o1[k], a)();
      } else {
        o2[k] = f3(k, i, a)();
      }
    }
    for (var k in o1) {
      if (k in o2) {
        continue;
      }
      f2(k, o1[k])();
    }
    return o2;
  };
};

exports.diffPropWithKeyAndIxE = function (o1, as, fk, f1, f2, f3, el) {
  return function () {
    var o2 = {};
    var replace = false;
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      var k = fk(a);
      if (o1.hasOwnProperty(k)) {
        o2[k] = f1(k, i, o1[k], a)();
      } else {
        o2[k] = f3(k, i, a)();
      }
    }
    for (var k in o1) {
      if (k in o2) {
        continue;
      }
      replace = true;
      f2(k, o1[k])();
    }
    if (replace)
      window.replaceView(el);
    return o2;
  };
};

exports.refEq = function (a, b) {
  return a === b;
};

exports.createTextNode = function (s, doc) {
  return function () {
    return {type: "textView", children: [], props: {text: s}}
  };
};

exports.setTextContent = function (s, n) {
  return function () {
    n.textContent = s;
  };
};

exports.createElement = function (ns, name, doc) {
  return function () {
    return {type: name, children: [], props: {}, __ref: window.createPrestoElement()}
  };
};

exports.insertChildIx = function (type, i, a, b) {
  return function () {
    var n = (b.children[i]) || {__ref: {__id: "-1"}};
    if(type === "block") {
      window.updateChild(a , b, i);
      return;
    }
    if (n === a) {
      return;
    }
    if (type !== "patch") {
      a.parentNode = b;
      b.children.splice(i, 0, a);
      return;
    }
    var index = b.children.indexOf(a);
    if (index !== -1) {
      b.children.splice(index, 1);
      window.moveChild(a, b, i);
    } else {
      window.addChild(a, b, i);
    }
    b.children.splice(i, 0, a);
    a.parentNode = b;
  };
};


exports.removeChild = function (a, b) {
  return function () {
    var childIndex = -1;

    if (b && a.parentNode.__ref.__id === b.__ref.__id) {
      for (var i=0; i<b.children.length; i++) {
        if (b.children[i].__ref.__id == a.__ref.__id) {
          childIndex = i;
        }
      }
    }

    if (childIndex > -1) {
      window.removeChild(a, b, childIndex);
      a.props.__removed = true;
      b.children.splice(childIndex, 1);
    }
  };
};

exports.unsafeParent = function (a) {
  if (a.parentNode.props.__removed) {
    a.props.__removed = true;
    return null;
  } else {
    return a.parentNode;
  }
};

exports.setAttribute = function (ns, attr, val, el) {
  return function () {
    if (ns != null) {
      el.setAttributeNS(ns, attr, val);
    } else {
      el.setAttribute(attr, val);
    }
  };
};

exports.removeAttribute = function (ns, attr, el) {
  return function () {
    if (ns != null) {
      el.removeAttributeNS(ns, attr);
    } else {
      el.removeAttribute(attr);
    }
  };
};

exports.addEventListener = function (pr, ev, listener, el) {
  return function () {
    try{
      if( (typeof window.manualEventsName != "undefined") && (Array.isArray(window.manualEventsName)) && (typeof window.setManualEvents == "function") && (window.manualEventsName.indexOf(ev) != -1)){
        window.setManualEvents(ev,listener);
      }
    } catch(err){
      console.error("Error while checking for manualEvents ");
    }
    // el.addEventListener(ev, listener, false);
    el.props[ev] = listener;
    if(pr == "patch") {
      window.replaceView(el);
    }
  };
};

exports.removeEventListener = function (ev, listener, el) {
  return function () {
     // el.removeEventListener(ev, listener, false);
     delete el.props[ev];
  };
};

// Wrapper function to extract views from Step to call compareNodes
exports.compareNode = function(a){
  return function(b){
      var oldCopy = R.clone(a.value0)
      var newCopy = R.clone(b.value0)
      return compareNodes(oldCopy,newCopy);
  }
}

/* Compare Node function
** Used to compare two views for block nodes
** Function returns true if both the views are equal
** Recurrsively checks if any child is not equal, breaking reccursion if a single false is reached
*/
var compareNodes = function(oldNode, newNode){
  // Below loop is added to remove functions from the view JSON
  // Functions are removed since comparison would always return false
  // TODO :: Add way to create an event level diff
  for(var key in oldNode.props){
    // Check on both old and new node, ensures that if an event is added or deleted it will trigger a diff (Rerender)
    if(typeof oldNode.props[key] == "function" && typeof newNode.props[key] == "function"){
      delete oldNode.props[key];
      delete newNode.props[key];
    }
  }
  // Setting default value for the Accumulator
  // Compare props of root views
  var acc = R.equals(oldNode.props,newNode.props) && oldNode.children.length == newNode.children.length;
  for(var i = 0; i < oldNode.children.length && acc; i++){
    // Compare children of root node
    acc = acc && compareNodes(oldNode.children[i],newNode.children[i]);
  }
  // Return if nodes are the same
  return acc;
}

exports.jsUndefined = void 0;
