let canvas;
let analyserNode;
let signalData;
let masterVolume;

function noteToHz(note) {
  switch (note) {
    case "C":
      return 261.63;
    case "C#":
    case "Db":
      return 277.18;
    case "D":
      return 293.66;
    case "D#":
    case "Eb":
      return 311.13;
    case "E":
      return 329.63;
    case "F":
      return 349.23;
    case "F#":
    case "Gb":
      return 369.99;
    case "G":
      return 392.0;
    case "G#":
    case "Ab":
      return 415.3;
    case "A":
      return 440.0;
    case "A#":
    case "Bb":
      return 466.16;
    case "B":
      return 493.88;
    default:
      return 0;
  }
}

function composeChord(chord) {
  switch (chord) {
    case "C":
      return ["C", "E", "G"]; // C Major
    case "Cm":
      return ["C", "D#", "G"]; // C Minor
    case "Cdim":
      return ["C", "D#", "F#"]; // C Diminished
    case "Caug":
      return ["C", "E", "G#"]; // C Augmented
    case "D":
      return ["D", "F#", "A"]; // D Major
    case "Dm":
      return ["D", "F", "A"]; // D Minor
    case "Ddim":
      return ["D", "F", "G#"]; // D Diminished
    case "Daug":
      return ["D", "F#", "A#"]; // D Augmented
    case "E":
      return ["E", "G#", "B"]; // E Major
    case "Em":
      return ["E", "G", "B"]; // E Minor
    case "Edim":
      return ["E", "G", "A#"]; // E Diminished
    case "Eaug":
      return ["E", "G#", "C"]; // E Augmented
    case "F":
      return ["F", "A", "C"]; // F Major
    case "Fm":
      return ["F", "G#", "C"]; // F Minor
    case "Fdim":
      return ["F", "G#", "A#"]; // F Diminished
    case "Faug":
      return ["F", "A", "C#"]; // F Augmented
    case "G":
      return ["G", "B", "D"]; // G Major
    case "Gm":
      return ["G", "A#", "D"]; // G Minor
    case "Gdim":
      return ["G", "A#", "C#"]; // G Diminished
    case "Gaug":
      return ["G", "B", "D#"]; // G Augmented
    case "A":
      return ["A", "C#", "E"]; // A Major
    case "Am":
      return ["A", "C", "E"]; // A Minor
    case "Adim":
      return ["A", "C", "D#"]; // A Diminished
    case "Aaug":
      return ["A", "C#", "F"]; // A Augmented
    case "B":
      return ["B", "D#", "F#"]; // B Major
    case "Bm":
      return ["B", "D", "F#"]; // B Minor
    case "Bdim":
      return ["B", "D", "F"]; // B Diminished
    case "Baug":
      return ["B", "D#", "G"]; // B Augmented
    default:
      return ["C", "E", "G"]; // Default to C Major
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
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    filterNode.tupe = "lowpass";
    filterNode.Q.setValueAtTime(100, this.audioContext.currentTime);
    filterNode.frequency.setValueAtTime(5000, this.audioContext.currentTime);

    // osc --> filter --> gain (voice) --> destination
    //                \--> gain (master) --^
    osc.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    filterNode.connect(this.gain);

    // connect it to the gain node
    this.gain.gain.setTargetAtTime(0.1, this.audioContext.currentTime, 0);
    gainNode.gain.setTargetAtTime(0.05, this.audioContext.currentTime, 0);

    // wrap around the container and add to array
    const oscContainer = {
      osc,
      isPlaying: false,
      baseFreq: freq,
      currentOctave: startOctave,
      gainNode,
      filterNode,
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

  updateFilter(osc, freq, Q) {
    osc.filterNode.frequency.setValueAtTime(
      freq,
      this.audioContext.currentTime
    );
    osc.filterNode.Q.setValueAtTime(Q, this.audioContext.currentTime);
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

function updateVolume(event, synth, oscIndex, masterVolume, voiceVolume) {}

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

  const voiceIds = ["activateVoice1", "activateVoice2", "activateVoice3"];
  voiceIds.forEach((id, index) => {
    document.getElementById(`${id}`).addEventListener("click", (event) => {
      console.log(`voice: ${id} start clicked`);
      synth.audioContext.resume();
      let osc = synth.oscillators[index];
      if (osc.isPlaying) {
        synth.stopOsc(osc);
        event.target.textContent = "On";
        event.target.style.backgroundColor = "#2f855a";
      } else {
        synth.startOsc(osc);
        event.target.textContent = "Off";
        event.target.style.backgroundColor = "red";
      }
    });
  });

  // handle waveform selection
  const waveChoices = ["wavechoice1", "wavechoice2", "wavechoice3"];
  waveChoices.forEach((id, index) => {
    document.querySelectorAll(`input[name='${id}']`).forEach((rb) => {
      rb.addEventListener("change", (event) => {
        let selectedWaveform = document.querySelector(
          `input[name='${id}']:checked`
        ).value;
        synth.oscillators[index].osc.type = selectedWaveform;
      });
    });
  });

  // Loop through each voice and set up its octave control buttons
  for (let i = 0; i < synth.oscillators.length; i++) {
    setupOctaveControls(i, synth); // Call setupOctaveControls for each voice
  }
  // detune
  ["1", "2", "3"].forEach((voiceNumber, index) => {
    const detuneSlider = document.getElementById(`detunevoice${voiceNumber}`);
    const detuneDisplay = document.getElementById(
      `detunevoice${voiceNumber}display`
    );
    detuneSlider.addEventListener("input", (event) => {
      let osc = synth.oscillators[index];
      let detune = parseFloat(detuneSlider.value);
      console.log(detune);
      detuneDisplay.textContent = detune;
      updateFrequency(event, synth, osc, index, null, null, detune);
    });
  });

  // master volume
  const masterVolumeSlider = document.getElementById("mastervol");
  const masterVolumeDisplay = document.getElementById("mastervoldisplay");
  masterVolumeSlider.addEventListener("input", (event) => {
    masterVolume = parseFloat(masterVolumeSlider.value);
    masterVolumeDisplay.textContent = masterVolume;
    synth.gain.gain.setValueAtTime(
      masterVolume,
      synth.audioContext.currentTime
    );
  });

  const volumeIds = ["volumevoice1", "volumevoice2", "volumevoice3"];

  volumeIds.forEach((id, index) => {
    let oscillator = synth.oscillators[index];

    const volSlider = document.getElementById(`${id}`);
    volSlider.setAttribute("max", synth.gain.gain.value);
    const volDisplay = document.getElementById(`${id}` + "display");
    volSlider.addEventListener("input", (event) => {
      let vol = parseFloat(volSlider.value);
      volDisplay.textContent = vol;
      volSlider.value = vol;
      oscillator.gainNode.gain.setValueAtTime(
        vol,
        synth.audioContext.currentTime
      );
    });
  });

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
      let voiceVol = synth.oscillators[viz.index].gainNode.gain.value;
      if (masterVolume + voiceVol > 1) {
        viz.ctx.fillStyle = "#ff5d52";
      } else {
        viz.ctx.fillStyle = "black";
      }

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

  const filterSlider = document.getElementById("filter");
  const filterSliderDisplay = document.getElementById("filterdisplay");
  filterSlider.addEventListener("input", (event) => {
    filtervalue = parseFloat(filterSlider.value);
    filterSliderDisplay.textContent = filtervalue;
    let osc = synth.oscillators[0];
    osc.filterNode.frequency.setValueAtTime(
      filtervalue,
      synth.audioContext.currentTime
    );
  });

  const QSlider = document.getElementById("Q");
  const QSliderDisplay = document.getElementById("Qdisplay");
  QSlider.addEventListener("input", (event) => {
    Qvalue = parseFloat(QSlider.value);
    QSliderDisplay.textContent = Qvalue;
    let osc = synth.oscillators[0];
    osc.filterNode.Q.setValueAtTime(Qvalue, synth.audioContext.currentTime);
  });
};
