/* global pillow */

; (function (global, P) {
  var RenderObjectModel = P.RenderObjectModel;
  var Img = P.Img;
  var Screen = P.Screen;
  var Sprite = P.Sprite;
  var Mouse = P.Mouse;
  var Timer = P.Timer;
  var math = P.Math;
  var FPSBoard = P.FPSBoard;
  var loader = new P.SourceLoader();
  var isFirst = true;

  var fpsBoard = new FPSBoard({
    container: '#container',
    width: 100,
    height: 60,
    boardColor: '#222',
    textColor: '#d2ff1d',
    containerStyles: {
      position: 'absolute'
    }
  });

  var CONFIG = {
    SCREENWIDTH: document.documentElement.clientWidth,
    SCREENHEIGHT: document.documentElement.clientHeight,
    GAP: '100'
  };

  var list = [{
    id: 'ceiling',
    src: 'images/ceiling.png'
  }, {
    id: 'land',
    src: 'images/land.png'
  }, {
    id: 'splash',
    src: 'images/splash.png'
  }, {
    id: 'bird',
    src: 'images/bird.png'
  }, {
    id: 'sky',
    src: 'images/sky.png'
  }, {
    id: 'pipe',
    src: 'images/pipe.png'
  }, {
    id: 'pipeDown',
    src: 'images/pipe-down.png'
  }, {
    id: 'pipeUp',
    src: 'images/pipe-up.png'
  }, {
    id: 'gameover',
    src: 'images/gameover.png'
  }];

  loader.on('success', function (i) {
    global.bird = new Bird(i);
  });

  loader.load(list);

  function Bird(images) {
    this.paused = true;
    this.stop = false;
    this.resource = images;
    this.init();
  }

  Bird.prototype = {
    init: function () {
      this.initScreen();
      this.initCeiling();
      this.initLand();
      this.initSky();
      this.initPipe();
      this.initBird();
      this.initWelcome();
      this.bind();
    },
    initScreen: function () {
      var that = this;
      this.screen = new Screen({
        container: document.querySelector('#screen'),
        width: CONFIG['SCREENWIDTH'],
        height: CONFIG['SCREENHEIGHT'],
        x: 0,
        y: 0
      });
      this.timer = new Timer();
      this.timer.update(function () {
        if (that.stop) {
          return;
        }
        that.screen.run();
        fpsBoard.tick();
      });
      this.timer.start();
    },
    initCeiling: function () {
      var that = this;
      var cellWidth = this.resource.ceiling.width;
      var cellHeight = this.resource.ceiling.height;
      var counter = Math.floor(CONFIG['SCREENWIDTH'] / cellWidth) + 3;
      var staticCounter = counter;
      while (counter--) {
        let container = new RenderObjectModel({
          x: counter * cellWidth,
          y: 0,
          width: CONFIG['SCREENWIDTH'],
          height: cellHeight
        });
        container.append(new Img({
          x: 0,
          y: 0,
          width: cellWidth,
          height: cellHeight,
          image: that.resource.ceiling.image
        }));
        container.update(function () {
          if (!that.paused && !that.stop) {
            if (this.x <= -cellWidth) {
              this.x = cellWidth * (staticCounter - 2);
            } else {
              this.x--;
            }
          }
        });
        this.screen.append(container);
      }
    },
    initLand: function () {
      var that = this;
      var cellWidth = this.resource.land.width;
      var cellHeight = this.resource.land.height;
      var counter = Math.floor(CONFIG['SCREENWIDTH'] / cellWidth) + 3;
      var staticCounter = counter;
      while (counter--) {
        var container = new RenderObjectModel({
          x: counter * cellWidth,
          y: CONFIG['SCREENHEIGHT'] - cellHeight,
          width: CONFIG['SCREENWIDTH'],
          height: cellHeight
        });
        container.append(new Img({
          x: 0,
          y: 0,
          width: cellWidth,
          height: cellHeight,
          image: this.resource.land.image
        }));
        container.update(function () {
          if (!that.paused && !that.stop) {
            if (this.x <= -cellWidth) {
              this.x = cellWidth * (staticCounter - 2);
            } else {
              this.x--;
            }
          }
        });
        this.screen.append(container);
      }
    },
    initSky: function () {
      var that = this;
      var cellWidth = this.resource.sky.width;
      var cellHeight = this.resource.sky.height;
      var counter = Math.floor(CONFIG['SCREENWIDTH'] / cellWidth) + 3;
      var staticCounter = counter;
      while (counter--) {
        var container = new RenderObjectModel({
          x: counter * cellWidth,
          y: CONFIG['SCREENHEIGHT'] - cellHeight - this.resource.land.height,
          width: CONFIG['SCREENWIDTH'],
          height: cellHeight
        });
        container.append(new Img({
          x: 0,
          y: 0,
          width: cellWidth,
          height: cellHeight,
          image: this.resource.sky.image
        }));
        container.update(function () {
          if (!that.paused && !that.stop) {
            if (this.x <= -cellWidth) {
              this.x = cellWidth * (staticCounter - 2);
            } else {
              this.x--;
            }
          }
        });
        this.screen.append(container);
      }
    },
    initWelcome: function () {
      var cellWidth = this.resource.splash.width;
      var cellHeight = this.resource.splash.height;
      var container = new RenderObjectModel({
        x: (CONFIG['SCREENWIDTH'] - cellWidth) / 2,
        y: (CONFIG['SCREENHEIGHT'] - cellHeight) / 3,
        width: cellWidth,
        height: cellHeight
      });
      var welcomeContainer = this.welcomeContainer = new Img({
        x: 0,
        y: 0,
        width: cellWidth,
        height: cellHeight,
        image: this.resource.splash.image
      });
      container.append(welcomeContainer);
      this.screen.append(container);
    },
    initGameover: function () {
      var cellWidth = this.resource.gameover.width;
      var cellHeight = this.resource.gameover.height;
      var container = new RenderObjectModel({
        x: (CONFIG['SCREENWIDTH'] - cellWidth) / 2,
        y: (CONFIG['SCREENHEIGHT'] - cellHeight) / 2.5,
        width: cellWidth,
        height: cellHeight
      });
      container.append(new Img({
        x: 0,
        y: 0,
        width: cellWidth,
        height: cellHeight,
        image: this.resource.gameover.image
      }));
      this.screen.append(container);
    },
    initBird: function () {
      var that = this;
      that.ySpeed = 0;
      var cellWidth = this.resource.bird.width;
      var cellHeight = this.resource.bird.height;
      var container = this.birdContainer = new RenderObjectModel({
        x: (CONFIG['SCREENWIDTH'] - cellWidth) / 2 - 80,
        y: (CONFIG['SCREENHEIGHT'] - cellHeight) / 2 + 20,
        width: cellWidth,
        height: cellHeight / 4
      });
      var bird = new Sprite({
        x: 0,
        y: 0,
        size: {
          width: cellWidth,
          height: cellHeight
        },
        width: cellWidth,
        height: cellHeight / 4,
        loop: true,
        image: this.resource.bird.image
      });
      this.birdTimer = new Timer();
      this.birdTimer.update(function () {
        if (!that.paused && !that.stop) {
          bird.next();
        }
      });
      this.birdTimer.start();
      container.append(bird);
      this.screen.append(container);
      this.screen.on('mousedown', function () {
        that.jumpUp();
        if (isFirst) {
          that.screen.removeLastChildren();
          isFirst = false;
          that.paused = false;
          container.update(function () {
            if (that.stop ||
              container.y > CONFIG['SCREENHEIGHT'] - that.resource.land.height - cellHeight / 4 ||
              container.y < that.resource.ceiling.height) {
              that.stopGame();
              return;
            }
            if (!that.paused && !that.stop) {
              container.y += that.ySpeed;
            }
          });
        }
      });
    },
    initPipe: function () {
      var that = this;
      var cellWidth = this.resource.pipe.width;
      var cellHeight = this.resource.pipe.height;
      var cellDownWidth = this.resource.pipeDown.width;
      var cellDownHeight = this.resource.pipeDown.height;
      var spaceHeight = Math.min(cellHeight, CONFIG['SCREENHEIGHT'] - this.resource.ceiling.height - this.resource.land.height);
      var counter = 1;
      var staticCounter = 4;
      while (counter <= staticCounter) {
        var valueX = CONFIG['SCREENWIDTH'] / 2 * counter;
        var containers = [];
        var random = math.getRandom(80, 230);
        var spaceLeft = spaceHeight - random - cellDownHeight - CONFIG['GAP'];
        var container = new RenderObjectModel({
          x: valueX,
          y: that.resource.ceiling.height,
          width: cellWidth,
          height: random
        });
        var pipeDownContainer = new RenderObjectModel({
          x: valueX,
          y: random,
          width: cellDownWidth,
          height: cellDownHeight
        });
        var downContainer = new RenderObjectModel({
          x: valueX,
          y: spaceHeight - spaceLeft + cellDownHeight + that.resource.ceiling.height,
          width: cellWidth,
          height: spaceLeft - cellDownHeight
        });
        var pipeUpContainer = new RenderObjectModel({
          x: valueX,
          y: spaceHeight - spaceLeft + that.resource.ceiling.height,
          width: cellWidth,
          height: cellDownHeight
        });
        containers.push(container);
        containers.push(pipeDownContainer);
        containers.push(downContainer);
        containers.push(pipeUpContainer);
        var pipe = new Img({
          x: 0,
          y: 0,
          width: cellWidth,
          height: random,
          image: this.resource.pipe.image
        });
        var pipeDown = new Img({
          x: 0,
          y: 0,
          width: cellDownWidth,
          height: cellDownHeight,
          image: this.resource.pipeDown.image
        });
        var downPipe = new Img({
          x: 0,
          y: 0,
          width: cellWidth,
          height: spaceLeft - cellDownHeight,
          image: this.resource.pipe.image
        });
        var pipeUp = new Img({
          x: 0,
          y: 0,
          width: cellDownWidth,
          height: cellDownHeight,
          image: this.resource.pipeUp.image
        });
        containers.forEach(container => {
          container.update(function () {
            if (!that.paused && !that.stop) {
              let bird = that.birdContainer;
              if (bird &&
                (bird.x > this.x - bird.width && bird.x < this.x + cellDownWidth) &&
                (bird.y > this.y - bird.height && bird.y < this.y + this.height)) {
                that.stop = true;
              }
              if (this.x <= -cellWidth) {
                this.x = CONFIG['SCREENWIDTH'] / 2 * (staticCounter - 1) + (CONFIG['SCREENWIDTH'] - 2 * cellWidth) / 2;
              } else {
                this.x--;
              }
            }
          });
        });
        container.append(pipe);
        pipeDownContainer.append(pipeDown);
        downContainer.append(downPipe);
        pipeUpContainer.append(pipeUp);
        this.screen.append(container);
        this.screen.append(pipeDownContainer);
        this.screen.append(downContainer);
        this.screen.append(pipeUpContainer);
        counter++;
      }
    },
    jumpUp: function () {
      var that = this;
      this.ySpeed = -1;
      if (!isFirst) {
        clearTimeout(this.jump);
      }
      this.jump = setTimeout(function () {
        that.ySpeed = 2;
      }, 400);
    },
    stopGame: function () {
      this.stop = true;
      this.initGameover();
    },
    bind: function () {
      var that = this;
      global.mouse = new Mouse({
        screen: that.screen
      });
    }
  };

})(window, pillow);
