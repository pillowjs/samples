/* global pillow */
;(function(global, P) {
  var Util = P._;
  var Screen = P.Screen;
  var Timer = P.Timer;
  var Graphics = P.Graphics;
  var Mouse = P.Mouse;
  var math = P.Math;

  function MouseEventDetector() {
    var that = this;
    that.init();
  }
  function createGraphics(screen) {
    var x = math.getRandom(10, 250);
    var y = math.getRandom(10, 250);
    var width = 100;
    var height = 100;

    var rect = new Graphics({
      fillStyle: '#333'
    });

    rect.rect(x, y, width, height);

    rect.on('mousemove', function(e) {
      this.fillStyle = 'green';
    });

    screen.append(rect);
  }
  var proto = {
    init: function() {
      var that = this;
      that.initScreen();
      that.addMods();
      that.bind();
      that.start();
    },
    addMods: function() {
      var that = this;
      for (var i = 0; i < 10; i++) {
        createGraphics(that.screen);
      }
      var rect = new Graphics({
        fillStyle: 'red'
      });
      rect.rect(10, 10, 50, 50);
      rect.on('mousemove', function(e) {
        this.fillStyle = 'white';
      });
      that.screen.children[that.screen.children.length - 1].append(rect);
    },
    initScreen: function() {
      var that = this;
      that.screen = new Screen({
        container: document.querySelector('#screen'),
        width: 800,
        height: 400,
        x: 0,
        y: 0
      });
    },
    bind: function() {
      var that = this;

      var m = new Mouse({
        screen: that.screen
      });
      console.log(m);
    },
    start: function() {
      var that = this;
      var timer = new Timer({
        fps: 60
      });
      timer.update(function() {
        that.screen.run();
      });
      timer.start();
    }
  };
  Util.augment(MouseEventDetector, proto);

  var m = new MouseEventDetector();
  console.log(m);
})(window, pillow);
