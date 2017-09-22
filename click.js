'use strict'

// This guy creates a click track for the tempo as well as a beat track for the specific sheet
var click = function(sheet, context) {
  this.sheet = sheet;
  this.tempo = sheet.tempo;
  this.beatMap = sheet.beatMap;
  this.context = context;
  // var startButton = document.getElementById('start-button');
  // var stopButton = document.getElementById('stop-button');
  // startButton.onclick = this.startPlayback.bind(this);
  // stopButton.onclick = this.stopPlayback.bind(this);


  // this.click = this.requestAudio("click.mp3");
}

click.prototype = {

  requestAudio: function(filename){
    var sourceBuffer;
    var request = new XMLHttpRequest();
    request.open('GET', filename, true);
    request.responseType = 'arraybuffer';
    sourceBuffer = this.context.createBufferSource();
    request.onload = this.decodeAudio.bind(this, request, sourceBuffer, this.context);
    request.send();
    return(sourceBuffer);
  },

  decodeAudio: function(request, sourceBuffer, context) {
    var undecodedAudio = request.response;
    context.decodeAudioData(undecodedAudio, function(buffer){
      sourceBuffer.buffer = buffer;
      sourceBuffer.connect(context.destination);
    })
  },

  startPlayback: function() {
    var time = 60 / this.tempo * 1000;
    this.clicks = 0;
    this.playClick();
    this.interval = window.setInterval(this.playClick.bind(this), time);
  },

  playClick: function() {
    var click = this.requestAudio("click.mp3");
    click.start();
    ++this.clicks;
    var clickLimit = this.sheet.timeSigTop * (this.sheet.measureCount + 1);
    if(this.clicks >= clickLimit)
      clearInterval(this.interval);
  },

  stopPlayback: function() {

  }
}
