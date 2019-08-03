const createHistoryObject = require("./");

const _o = createHistoryObject({ hello: "world" });
_o.foo = "bar";
delete _o.hello;
console.log(_o);
_o._undo(2);
console.log(_o);
