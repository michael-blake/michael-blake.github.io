'use strict'

var sheet = function(tempo, timeSigTop, timeSigBottom, measures, beatMap, sheetDiv) {
  this.tempo = tempo;                     // Beats Per Minute
  this.timeSigTop = timeSigTop;           // Beats Per Measure
  this.timeSigBottom = timeSigBottom;     // Note that determines beat
  this.measureCount = measures;           // Number of measure
  this.beatMap = beatMap;                 // 4 in 4/4 time is one whole note
  this.sheetDiv = sheetDiv;               // The div where this all lives

  // this.resolution = this.getResolution();
  this.resolution = 32;
  this.measures = [];
}

sheet.prototype = {

  getDuration: function() {
    return 60 * this.timeSigTop * this.measureCount / this.tempo;
  },

  getResolution: function() {
    return Math.min.apply( Math, this.beatMap );
  },

  renderBeatMap: function() {
    this.makeStaff();
    var measureIndex = 0;     // Start at the first measure
    var resRemaining = this.resolution;  // Beat ~Resolutions~ remaining in each measure
    var remainder = 0;

    for(var i = 0; i < this.beatMap.length; ++i){
      var currentMeasure = this.measures[measureIndex];
      var beatRes = this.reckonBeat(this.beatMap[i]);
      console.log(resRemaining);
      if(remainder > 0){
        this.addNote(remainder, currentMeasure, false);
      }
      if(beatRes < resRemaining){
        this.addNote(beatRes, currentMeasure, false);
        resRemaining = resRemaining - beatRes;
      }
      else if(beatRes >= resRemaining){
        this.addNote(beatRes, currentMeasure, true);
        ++measureIndex;
        remainder = beatRes - resRemaining;
        resRemaining = this.resolution;
      }
    }
  },

  reckonNote: function(beats) {
    return this.resolution / beats;
  },

  reckonBeat: function(beat) {
    return this.resolution * this.timeSigTop / (this.timeSigBottom * beat);
  },

  makeStaff: function() {
    var measureWidth = this.sheetDiv.clientWidth / this.measureCount;
    for (var i = 0; i < this.measureCount; ++i){
      var measure = document.createElement('div');
      measure.classList.add('measure');
      this.sheetDiv.appendChild(measure);
      this.measures.push(measure);
    }

  },

  addNote: function(beat, measureElem, fTie) {
    var note = document.createElement('div');
    var noteValue = this.reckonNote(beat);
    switch(noteValue){
      case 32:
        note.className ='thirtysecond note';
      break;
      case 16:
        note.className ='sixteenth note';
      break;
      case 8:
        note.className ='eighth note';
      break;
      case 4:
        note.className ='quarter note';
      break;
      case 2:
        note.className ='half note';
      break;
      case 1:
        note.className ='whole note';
      break;
    }
    measureElem.appendChild(note);
  }
}


// var test = new sheet(120, 4, 4, 1, 1, [QUARTER,HALF,HALF,HALF,QUARTER]);
// 32
// 16
// 8
// 4
// 2
// 1

// triplet
// dotted
// rest
