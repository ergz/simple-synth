let canvas;
let analyserNode;
let signalData;

function noteToHz(note) {
  switch (note) {
    case "C":
      return 261.63;
    case "D":
      return 293.66;
    case "E":
      return 329.63;
    case "F":
      return 349.23;
    case "G":
      return 392;
    case "A":
      return 440;
    case "B":
      return 493.88;
    default:
      return 0;
  }
}

function composeChord(chord) {
  switch (chord) {
    case "C": {
      return ["C", "G", "E"];
    }
    case "D": {
      return ["D", "F", "A"];
    }
    case "E": {
      return ["E", "G", "B"];
    }
    case "F": {
      return ["F", "A", "C"];
    }
    case "G": {
      return ["G", "B", "D"];
    }
    case "A": {
      return ["A", "C", "E"];
    }
    case "B": {
      return ["B", "D", "F"];
    }
    default: {
      return ["C", "D", "E"];
    }
  }
}

class Synth {
  constructor() {
    this.audioContext = new AudioContext();
    this.gain = this.audioContext.createGain();
    this.oscillators = [
      this.createOscillator("sine", 261.63, 0),
      this.createOscillator("sine", 261.63, 0),
      this.createOscillator("sine", 261.63, 0),
    ];
    this.gain.connect(this.audioContext.destination);
  }

  createOscillator(type = "sine", freq = 440, startOctave) {
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    // connect it to the gain node
    this.gain.gain.setTargetAtTime(0.1, this.audioContext.currentTime, 0);
    osc.connect(this.gain);

    // wrap around the container and add to array
    const oscContainer = {
      osc,
      isPlaying: false,
      baseFreq: freq,
      currentOctave: startOctave,
    };
    return oscContainer;
  }

  startOsc(oscContainer) {
    if (!oscContainer.isPlaying) {
      oscContainer.osc.start();
      oscContainer.isPlaying = true;
    }
  }

  stopOsc(oscContainer) {
    if (oscContainer.isPlaying) {
      let currentFreq = oscContainer.osc.frequency.value;
      console.log("the current frequency: " + currentFreq);
      let currentType = oscContainer.osc.type;
      console.log("the current type: " + currentType);
      oscContainer.osc.stop();
      oscContainer.isPlaying = false;
      oscContainer.osc = this.audioContext.createOscillator();
      oscContainer.osc.type = currentType;
      oscContainer.osc.frequency.setValueAtTime(
        currentFreq,
        this.audioContext.currentTime
      );
      oscContainer.osc.connect(this.gain);
      console.log(oscContainer);
    }
  }

  stopAll() {
    for (let osc of this.oscillators) {
      this.stopOsc(osc);
    }
  }

  createFilter(type, freq, Q) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    filter.Q.setValueAtTime(Q, this.audioContext.currentTime);
    return filter;
  }
}

let synth = new Synth();

function updateFrequency(
  event,
  synth,
  oscContainer,
  voiceIndex,
  note,
  octaveShift,
  detuneAmount
) {
  let baseFreq = oscContainer.baseFreq;
  let currentFreq = baseFreq;

  if (octaveShift) {
    if (octaveShift === "up") {
      currentFreq = baseFreq * 2;
      oscContainer.baseFreq = currentFreq;
    } else {
      currentFreq = baseFreq / 2;
      oscContainer.baseFreq = currentFreq;
    }
  }

  if (note) {
    let noteInHz = noteToHz(note);
    // if the note in hz is not in the octave the oscillator is currently at
    // I will need to transform it down to the correct octave.
    currentFreq = noteInHz;
    oscContainer.baseFreq = noteInHz;
    oscContainer.currentOctave = 0;
    let octaveDisplay = document.getElementById(
      "octavedisplay" + (voiceIndex + 1)
    );
    console.log(octaveDisplay);
    console.log("octavedisplay" + (voiceIndex + 1));
    octaveDisplay.value = 0;
    console.log(noteInHz);
    console.log("current octave for voice: " + oscContainer.currentOctave);
  }

  if (detuneAmount) {
    currentFreq = currentFreq + detuneAmount;
  }

  console.log(currentFreq);

  oscContainer.osc.frequency.setValueAtTime(
    currentFreq,
    synth.audioContext.currentTime
  );
}

function setupOctaveControls(voiceIndex, synth) {
  // Get the display element for the current voice
  let octaveDisplay = document.getElementById(
    "octavedisplay" + (voiceIndex + 1)
  );

  // Set up event listener for the octave down button for the current voice
  document
    .getElementById("octavedown" + (voiceIndex + 1))
    .addEventListener("click", (event) => {
      const osc = synth.oscillators[voiceIndex];
      osc.currentOctave--;
      octaveDisplay.value = osc.currentOctave;
      updateFrequency(event, synth, osc, voiceIndex, null, "down", null);
    });

  // Set up event listener for the octave up button for the current voice
  document
    .getElementById("octaveup" + (voiceIndex + 1))
    .addEventListener("click", (event) => {
      const osc = synth.oscillators[voiceIndex];
      osc.currentOctave++;
      octaveDisplay.value = osc.currentOctave;
      updateFrequency(event, synth, osc, voiceIndex, null, "up", null);
    });
}

// onload ------------------------------------------------------------------
window.onload = function () {
  // start button

  document
    .getElementById("activateVoice1")
    .addEventListener("click", (event) => {
      console.log("voice 1 start clicked");
      synth.audioContext.resume();
      let osc1 = synth.oscillators[0];
      if (osc1.isPlaying) {
        synth.stopOsc(osc1);
        event.target.textContent = "On";
        event.target.style.backgroundColor = "#2f855a";
      } else {
        synth.startOsc(osc1);
        event.target.textContent = "Off";
        event.target.style.backgroundColor = "red";
      }
    });

  document
    .getElementById("activateVoice2")
    .addEventListener("click", (event) => {
      console.log("voice 2 start clicked");
      synth.audioContext.resume();
      let osc2 = synth.oscillators[1];
      if (osc2.isPlaying) {
        synth.stopOsc(osc2);
        event.target.textContent = "On";
        event.target.style.backgroundColor = "#2f855a";
      } else {
        synth.startOsc(osc2);
        event.target.textContent = "Off";
        event.target.style.backgroundColor = "red";
      }
    });

  document
    .getElementById("activateVoice3")
    .addEventListener("click", (event) => {
      console.log("voice 3 start clicked");
      synth.audioContext.resume();
      let osc3 = synth.oscillators[2];
      if (osc3.isPlaying) {
        synth.stopOsc(osc3);
        event.target.textContent = "On";
        event.target.style.backgroundColor = "#2f855a";
      } else {
        synth.startOsc(osc3);
        event.target.textContent = "Off";
        event.target.style.backgroundColor = "red";
      }
    });

  // handle waveform selection
  document.querySelectorAll("input[name='wavechoice1']").forEach((rb) => {
    rb.addEventListener("change", (event) => {
      let selectedWaveform = document.querySelector(
        "input[name='wavechoice1']:checked"
      ).value;
      synth.oscillators[0].osc.type = selectedWaveform;
    });
  });

  document.querySelectorAll("input[name='wavechoice2']").forEach((rb) => {
    rb.addEventListener("change", (event) => {
      let selectedWaveform = document.querySelector(
        "input[name='wavechoice2']:checked"
      ).value;
      synth.oscillators[1].osc.type = selectedWaveform;
    });
  });

  document.querySelectorAll("input[name='wavechoice3']").forEach((rb) => {
    rb.addEventListener("change", (event) => {
      let selectedWaveform = document.querySelector(
        "input[name='wavechoice3']:checked"
      ).value;
      synth.oscillators[2].osc.type = selectedWaveform;
    });
  });

  // Loop through each voice and set up its octave control buttons
  for (let i = 0; i < synth.oscillators.length; i++) {
    setupOctaveControls(i, synth); // Call setupOctaveControls for each voice
  }
  // detune
  const detuneSliderVoice1 = document.getElementById("detunevoice1");
  const detunevoice1Display = document.getElementById("detunevoice1display");
  detuneSliderVoice1.addEventListener("input", (event) => {
    let osc = synth.oscillators[0];
    let detune = parseFloat(detuneSliderVoice1.value);
    console.log(detune);
    updateFrequency(event, synth, osc, 0, null, null, detune);
  });

  // const filterSliderVoice1 = document.getElementById("filtervoice1");
  // const filtervoice1Display = document.getElementById("filtervoice1display");
  // filterSliderVoice1.addEventListener("input", (event) => {
  //   const osc = synth.oscillators[0];
  //   let selectedFreq = parseFloat(filterSliderVoice1.value);
  //   const lpf = synth.createFilter("lowpass", 500, 1);
  //   osc.osc.connect(lpf);
  //   lpf.connect(synth.gain);
  // });

  // handle chord changes
  document.querySelectorAll("input[name='chordchoice']").forEach((rb) => {
    rb.addEventListener("change", (event) => {
      let selectedChord = document.querySelector(
        "input[name='chordchoice']:checked"
      ).value;
      let notesForChord = composeChord(selectedChord);
      console.log(notesForChord);
      for (let i = 0; i < synth.oscillators.length; i++) {
        if (synth.oscillators[i].isPlaying) {
          console.log("playing note: " + notesForChord[i] + " on voice: " + i);
          updateFrequency(
            event,
            synth,
            synth.oscillators[i],
            i,
            notesForChord[i],
            null,
            null
          );
        }
      }
    });
  });

  // do the viz
  const canvasIds = ["wave1canvas", "wave2canvas", "wave3canvas"];

  const vizObjects = canvasIds.map((id, index) => {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext("2d");

    const analyser = synth.audioContext.createAnalyser();
    analyser.fftSize = 2048;

    synth.oscillators[index].osc.connect(analyser);
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    return { canvas, ctx, analyser, index, bufferLength, dataArray };
  });

  function draw() {
    vizObjects.forEach((viz) => {
      viz.analyser.getByteTimeDomainData(viz.dataArray);
      viz.ctx.clearRect(0, 0, viz.canvas.width, viz.canvas.height);
      viz.ctx.fillStyle = "black";
      viz.ctx.fillRect(0, 0, viz.canvas.width, viz.canvas.height);
      viz.ctx.lineWidth = 2;
      viz.ctx.strokeStyle = "rgb(0, 200, 100)";

      viz.ctx.shadowBlur = 12; // Adjust the level of glow by changing this value
      viz.ctx.shadowColor = "rgb(0, 200, 100)"; // Make sure the shadow color matches the stroke color
      viz.ctx.shadowOffsetX = 2;
      viz.ctx.shadowOffsetY = 5;

      viz.ctx.beginPath();

      const sliceWidth = (viz.canvas.width * 1.0) / viz.bufferLength;
      let x = 0;

      for (let i = 0; i < viz.bufferLength; i++) {
        const v = viz.dataArray[i] / 128.0;
        const y = (v * viz.canvas.height) / 2;

        if (i === 0) {
          viz.ctx.moveTo(x, y);
        } else {
          viz.ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      viz.ctx.lineTo(viz.canvas.width, viz.canvas.height / 2);
      viz.ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  draw();
};
