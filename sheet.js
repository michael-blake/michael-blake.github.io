'use strict'

var sheet = function(tempo, timeSigTop, timeSigBottom, measures, beatMap, sheetDiv) {
  this.tempo = tempo;                     // Beats Per Minute
  this.timeSigTop = timeSigTop;           // Beats Per Measure
  this.timeSigBottom = timeSigBottom;     // Note that determines beat
  this.measureCount = measures;           // Number of measure
  this.beatMap = beatMap;                 // 4 in 4/4 time is one whole note
  this.sheetDiv = sheetDiv;               // The div where this all lives

  this.smallest = this.getResolution();
  this.resolution = 32;
  this.measures = [];
  this.rPM = this.getResolutionsPerMeasure();
}

sheet.prototype = {

  getDuration: function() {
    return 60 * this.timeSigTop * this.measureCount / this.tempo;
  },

  getResolution: function() {
    return Math.min.apply( Math, this.beatMap );
  },

  getResolutionsPerMeasure() {
    return this.resolution * this.timeSigTop / this.timeSigBottom;
  },

  renderBeatMap: function() {
    this.makeStaff();
    this.makeCounter();
    var measureIndex = 0;     // Start at the first measure
    var resRemaining = this.rPM;  // Beat ~Resolutions~ remaining in each measure
    var remainder = 0;
    var note;
    var prevNote = null;

    // for(var i = 0; i < this.beatMap.length; ++i){
    //   var currentMeasure = this.measures[measureIndex];
    //   var beatRes = this.reckonBeat(this.beatMap[i]);
    //   console.log(resRemaining);
    //   if(remainder > 0){
    //     note = this.addNote(remainder, prevNote, false);
    //     prevNote = note;
    //   }
    //   if(beatRes < resRemaining){
    //     note = this.addNote(beatRes, prevNote, false);
    //     resRemaining = resRemaining - beatRes;
    //     prevNote = note;
    //   }
    //   else if(beatRes >= resRemaining){
    //     note = this.addNote(beatRes, prevNote, true);
    //     ++measureIndex;
    //     prevNote = note;
    //     remainder = beatRes - resRemaining;
    //     resRemaining = this.resolution;
    //   }
    // }

    for(var i = 0; i < this.beatMap.length; ++i){
      var currentMeasure = this.measures[measureIndex];
      var beatRes = this.reckonNoteAsRes(this.beatMap[i]);
      console.log(resRemaining);
      if(remainder > 0){
        note = this.addNote(remainder, prevNote, false);
        prevNote = note;
      }
      if(beatRes < resRemaining){
        note = this.addNote(beatRes, prevNote, false);
        resRemaining = resRemaining - beatRes;
        prevNote = note;
      }
      else if(beatRes >= resRemaining){
        note = this.addNote(beatRes, prevNote, true);
        ++measureIndex;
        prevNote = note;
        remainder = beatRes - resRemaining;
        resRemaining = this.rPM;
      }
    }

  },

  reckonResAsBeats: function(res) {
    return res / this.rPM * this.timeSigTop;
  },

  reckonNoteAsRes: function(note) {
    return this.resolution / note;
  },

  reckonResAsNote: function(res) {
    var beats = this.reckonResAsBeats(res);
    return this.timeSigBottom / beats;
  },
  
  makeStaff: function() {
    this.noteDiv = document.getElementById('note-div');
    this.measureWidth = this.sheetDiv.clientWidth / this.measureCount;
    var initialBreak = document.createElement('div');
    initialBreak.classList.add('measure-break');
    this.sheetDiv.appendChild(initialBreak);
    for (var i = 0; i < this.measureCount; ++i){
      var measure = document.createElement('div');
      var measureBreak = document.createElement('div');
      measure.classList.add('measure');
      measureBreak.classList.add('measure-break');
      this.sheetDiv.appendChild(measure);
      this.sheetDiv.appendChild(measureBreak);
      this.measures.push(measure);
    }

  },

  makeCounter: function() {
    this.counter = document.getElementById('counter');
    var beatsPerMeasure = this.timeSigTop;
    for (var i = 0; i < this.measureCount; ++i){
      var counterMeasure = document.createElement('div');
      counterMeasure.classList.add('counter-measure');
      counter.appendChild(counterMeasure);
      for (var j = 0; j < this.timeSigTop; ++j){
        var counterNumber = document.createElement('div');
        counterNumber.classList.add('counter-number');
        counterMeasure.appendChild(counterNumber);
        counterNumber.innerHTML=j + 1;
      }
    }
  },

  addNote: function(beatRes, prevNote, fTie) {
    var note = document.createElement('div');
    note.beats = this.reckonResAsBeats(beatRes);
    note.note = this.reckonResAsNote(beatRes);

    switch(note.note){
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

    this.noteDiv.appendChild(note);

    if(prevNote != null){
      // var noteBeats = this.reckonBeat(beat);
      // var margin = (measureElem.clientWidth -20) / prevNote.value - 0.5*(note.clientWidth + prevNote.clientWidth);
      var margin = (this.measureWidth) * prevNote.beats / this.timeSigTop - 0.5 * (note.clientWidth + prevNote.clientWidth);
      note.style.marginLeft = margin;
    } else note.style.marginLeft = 25 - 0.5 * note.clientWidth;

    return note;
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
