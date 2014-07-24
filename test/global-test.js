function equals(obj1, obj2) {
  for (var prop in obj1) {
    if (obj1[prop] !== obj2[prop] || obj2.hasOwnProperty(prop) === false) {
      return false;
    }
  }

  return true;
}

test("global.getToken()能够给出一个token", function() {
  var options   = { snapshots: false, audio: false },
      sayCheese = new SayCheese('#camera-test', options);

  ok(equals(sayCheese.options, options), "options correctly set");

  options.audio = true
  sayCheese.setOptions(options);

  ok(equals(sayCheese.options, options), "options correctly updated");
});
