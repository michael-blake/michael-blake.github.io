'use strict'

var waveform = function(sheet, click, context) {
  this.sheet = sheet;
  this.click = click;
  this.context = context;
  this.graph = document.getElementById('signal-graph');
  this.graphContext = this.graph.getContext('2d');
  this.duration = this.sheet.getDuration();
  this.analyser = context.createAnalyser();
  this.analyser.fftSize = 2048;
  this.sampleBuffer = new Float32Array(this.analyser.fftSize);
  this.scalePowerLimit = 10 ** (-4/10);  // Default limit at -1dB
  var startButton = document.getElementById('start-button');
  var stopButton = document.getElementById('stop-button');
  startButton.onclick = this.startAnimation.bind(this);
  stopButton.onclick = this.stopAnimation.bind(this);
  this.fDraw = false;
  this.loop();
}

waveform.prototype = {

  startAnimation: function() {
    this.click.startPlayback();
    this.countDown();
    var timeout = this.duration / this.sheet.measureCount * 1000 + 125;
    setTimeout(this.continueAnimation.bind(this), timeout);
  },

  countDown: function() {

  },

  continueAnimation: function() {
    var cursor = document.getElementById('cursor');
    var graph = document.getElementById('signal-graph');
    cursor.style.transform = 'translateX(' + this.graph.width + 'px)';
    cursor.style.transitionDuration = this.duration + 's';
    this.fDraw = true;
    this.startTime = this.context.currentTime;
  },

  loop: function() {
    this.analyser.getFloatTimeDomainData(this.sampleBuffer);
    let peakInstantaneousPower = 0;
    for (let i = 0; i < this.sampleBuffer.length; i++) {
      const power = this.sampleBuffer[i] ** 2;
      peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
    }
    const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
    this.displayLevel(peakInstantaneousPowerDecibels);

    if(this.fDraw){
      var time = this.context.currentTime - this.startTime;
      if(peakInstantaneousPowerDecibels > -12)
        this.drawSignalGraph(time, peakInstantaneousPower, true);
      else
        this.drawSignalGraph(time, peakInstantaneousPower, false);
    }
    requestAnimationFrame(this.loop.bind(this));
  },

  displayLevel: function(value) {
    const meter = document.getElementById('level');
    meter.value = isFinite(value) ? value : meter.min;
  },

  stopAnimation: function() {
    this.click.stopPlayback();
    // cursor.style.transform = 'translateX(' + 0 + 'px)';
    // cursor.style.transitionDuration = 0 + 's';
  },

  drawSignalGraph: function(time, power, fTransient) {

    var x = time / this.duration * this.graph.width;
    var y =  power / this.scalePowerLimit * this.graph.height / 2;

    if(fTransient){
      this.graphContext.fillStyle = "#FF0000";
      console.log(time)
    }
    else {
      this.graphContext.fillStyle = "#000000";
    }
    this.graphContext.fillRect(x,this.graph.height/2,1,y);
    this.graphContext.fillRect(x,this.graph.height/2,1,-y);
  },

  startPlayback: function() {
    this.playCountIn();
  }
}
