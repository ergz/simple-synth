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

class Synth {
  constructor() {
    this.audioContext = new AudioContext();
    this.gain = this.audioContext.createGain();
    this.oscillators = [
      this.createOscillator("sawtooth", 440, 0),
      this.createOscillator("sawtooth", 435, 0),
      this.createOscillator("sawtooth", 440, 0),
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
}

function updateFrequency(
  event,
  synth,
  oscContainer,
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
      updateFrequency(event, synth, osc, "down", voiceIndex);
    });

  // Set up event listener for the octave up button for the current voice
  document
    .getElementById("octaveup" + (voiceIndex + 1))
    .addEventListener("click", (event) => {
      const osc = synth.oscillators[voiceIndex];
      osc.currentOctave++;
      octaveDisplay.value = osc.currentOctave;
      updateFrequency(event, synth, osc, "up", voiceIndex);
    });
}

window.onload = function () {
  let synth = new Synth();
  // start button

  document
    .getElementById("activateVoice1")
    .addEventListener("click", (event) => {
      console.log("voice 1 start clicked");
      synth.audioContext.resume();
      let osc1 = synth.oscillators[0];
      if (osc1.isPlaying) {
        synth.stopOsc(osc1);
        event.target.textContent = "Start";
        event.target.style.backgroundColor = "greenyellow";
      } else {
        synth.startOsc(osc1);
        event.target.textContent = "Stop";
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
        event.target.textContent = "Start";
        event.target.style.backgroundColor = "greenyellow";
      } else {
        synth.startOsc(osc2);
        event.target.textContent = "Stop";
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
        event.target.textContent = "Start";
        event.target.style.backgroundColor = "greenyellow";
      } else {
        synth.startOsc(osc3);
        event.target.textContent = "Stop";
        event.target.style.backgroundColor = "red";
      }
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
    updateFrequency(event, synth, osc, null, detune);
  });
};
