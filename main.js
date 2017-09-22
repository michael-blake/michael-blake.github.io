'use strict'

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// var sheetArray = [
//   [120, 4, 4, 2, [4,2,2,2,4], staff],
// 110, 3, 4, 2, [2,8,2,8,4], staff,


window.onload = function() {
  var context = new (window.AudioContext || window.webkitAudioContext)();
  var staff = document.getElementById('staff');
  var selector = document.getElementById('selector');
  selector.oninput = selectOption;
  const gain1 = context.createGain();
  const gain2 = context.createGain();
  gain2.gain.value = 0.02;
  if (navigator.mediaDevices) {
    console.log('getUserMedia supported.');
  };

  var testSheet;
  var clicker;
  var waveformer;

  // (tempo, timeSigTop, timeSigBottom, resolution, measures, beatMap, sheetDiv)


  drawScale();

  function selectOption() {
    if(selector.options.selectedIndex == 1)
      loadSheet(1);
    else if(selector.options.selectedIndex == 2)
      loadSheet(2);
    else if(selector.options.selectedIndex == 3)
      loadSheet(3);
    selector.disabled = true;
  }

  function loadSheet(diff) {
    if(diff == 1)
      testSheet = new sheet(110, 4, 4, 2, [2,4,8,4,8,8,8,4,4], staff);
    else if(diff == 2)
      testSheet = new sheet(130, 3, 4, 2, [8,4,4,8,8,16,16,8,4,8], staff);
    else if(diff == 3)
      testSheet = new sheet(130, 4, 4, 2, [16,8,4,16,8,8,8,4,4,4,4,8], staff);

    clicker = new click(testSheet, context);
    waveformer = new waveform(testSheet, clicker, context);
    var promise = navigator.mediaDevices.getUserMedia({audio:true})
    .then(gotStream.bind(this));
    testSheet.renderBeatMap();
    var duration = testSheet.getDuration();

  }

  function gotStream(stream) {
    var source = context.createMediaStreamSource(stream);
    connect(source);
  }

  function connect(source) {
    source.connect(gain1);
    gain1.connect(waveformer.analyser);
    waveformer.analyser.connect(gain2);
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

  // function loop() {
  //   analyser.getFloatTimeDomainData(sampleBuffer);
  //   let peakInstantaneousPower = 0;
  //   for (let i = 0; i < sampleBuffer.length; i++) {
  //     const power = sampleBuffer[i] ** 2;
  //     peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
  //   }
  //   const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
  //   displayLevel(peakInstantaneousPowerDecibels);
  //
  //   if(peakInstantaneousPowerDecibels > -12)
  //     waveformer.drawSignalGraph(context.currentTime, peakInstantaneousPower, true);
  //   else
  //     waveformer.drawSignalGraph(context.currentTime, peakInstantaneousPower, false);
  //
  //   requestAnimationFrame(loop);
  // }
}
