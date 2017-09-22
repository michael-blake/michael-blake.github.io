'use strict'

// window.onload = function() {
//   EQ.initialize();
// }
//
// var EQ = {
//
//   drawGraph: function(){

//   },
//
//   requestAudio: function(filename){

//   },
//
//   createFilter: function(){

//   }
// }






//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

window.onload = function() {
  var context = new (window.AudioContext || window.webkitAudioContext)();
  const gain1 = context.createGain();
  const analyser = context.createAnalyser();
  const gain2 = context.createGain();
  gain2.gain.value = 0.02;
  var promise = navigator.mediaDevices.getUserMedia({audio:true})
  .then(gotStream);

  if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
  };

  // Time domain samples are always provided with the count of
  // fftSize even though there is no FFT involved.
  // (Note that fftSize can only have particular values, not an
  // arbitrary integer.)
  analyser.fftSize = 2048;
  const sampleBuffer = new Float32Array(analyser.fftSize);
  var graph = document.getElementById('signal-graph');
  var graphContext = graph.getContext('2d');
  var scalePowerLimit = 10 ** (-4/10);  // Default limit at -1dB
  var staff = document.getElementById('staff');

  drawScale();
  // (tempo, timeSigTop, timeSigBottom, resolution, measures, beatMap, sheetDiv)
  var testSheet = new sheet(60, 4, 4, 2, [2,4,4,2,4,4], staff)
  testSheet.renderBeatMap();
  var duration = testSheet.getDuration();


  // The Machine //
  // const machine = requestAudio("TheMachine.mp3");
  // machine.connect(gain2);
  // machine.start();
  // var startTime = context.currentTime;
  // var stopButton = document.getElementById('stop-button');
  // stopButton.onclick = function(){
  //   machine.stop();
  // }

  loop();
  animateCursor();














  function gotStream(stream) {
    var source = context.createMediaStreamSource(stream);
    source.connect(context.destination);
    connect(source);
  }

  function connect(source) {
    source.connect(gain1);
    gain1.connect(analyser);
    analyser.connect(gain2);
    gain2.connect(context.destination);
  }

  function drawScale() {
    var scale = document.getElementById('scale');
    var dbMarkers = [12, 9, 6, 3, 1];
    for(var i = 0; i < dbMarkers.length; ++i){
      var height = 10 ** (-dbMarkers[i]/10) * 50;
      var node = document.getElementById('db-marker');
      var dupe1 = node.cloneNode(true);
      var dupe2 = node.cloneNode(true);
      dupe1.innerHTML = '-' + dbMarkers[i];
      dupe2.innerHTML = '-' + dbMarkers[i];
      dupe1.setAttribute('y', 50 + height + '%');
      dupe2.setAttribute('y', 50 - height + '%');
      scale.appendChild(dupe1);
      scale.appendChild(dupe2);
    }
  };

  function animateCursor(){
    var cursor = document.getElementById('cursor');
    cursor.style.transform = 'translateX(' + graph.width + 'px)';
    cursor.style.transitionDuration = duration + 's';
  }

  function getTimeLocation(time, duration, width){
    return time / duration * width;
  }

  function drawSignalGraph(time, power, fTransient) {
    var x = getTimeLocation(time, duration, graph.width);
    var y =  power / scalePowerLimit * graph.height / 2;

    if(fTransient){
      graphContext.fillStyle = "#FF0000";
      console.log(time)
    }
    else {
      graphContext.fillStyle = "#000000";
    }
    graphContext.fillRect(x,graph.height/2,1,y);
    graphContext.fillRect(x,graph.height/2,1,-y);
  }

  function processAudioTransients() {
    console.log('dunzo');
  }

  function requestAudio(filename){
    var sourceBuffer;
    var request = new XMLHttpRequest();
    request.open('GET', filename, true);
    request.responseType = 'arraybuffer';
    sourceBuffer = context.createBufferSource();
    request.onload = function() {
      var undecodedAudio = request.response;
      context.decodeAudioData(undecodedAudio, function(buffer){
        sourceBuffer.buffer = buffer;
        sourceBuffer.connect(context.destination);
        loop();
      });
    }
    request.send();
    return(sourceBuffer);
  }

  function displayNumber(id, value) {
    const meter = document.getElementById(id + '-level');
    const text = document.getElementById(id +'-level-text');
    text.textContent = value.toFixed(2);
    meter.value = isFinite(value) ? value : meter.min;
  }

  function loop() {
    analyser.getFloatTimeDomainData(sampleBuffer);

    // Compute average power over the interval.
    let sumOfSquares = 0;
    for (let i = 0; i < sampleBuffer.length; i++) {
      sumOfSquares += sampleBuffer[i] ** 2;
    }
    const avgPowerDecibels = 10 * Math.log10(sumOfSquares / sampleBuffer.length);

    // Compute peak instantaneous power over the interval.
    let peakInstantaneousPower = 0;
    for (let i = 0; i < sampleBuffer.length; i++) {
      const power = sampleBuffer[i] ** 2;
      peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
    }
    const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);

    // Note that you should then add or subtract as appropriate to
    // get the _reference level_ suitable for your application.

    // Display value.
    displayNumber('avg', avgPowerDecibels);
    displayNumber('inst', peakInstantaneousPowerDecibels);
    if(peakInstantaneousPowerDecibels > -12)
      drawSignalGraph(context.currentTime, peakInstantaneousPower, true);
    else
      drawSignalGraph(context.currentTime, peakInstantaneousPower, false);
    requestAnimationFrame(loop);
  }
}
