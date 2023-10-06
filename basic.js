let osc = null;
let gain = null;
let selectedWave = "square";
let baseFreq = 440;
let currentFreq = 261.63;
let notes = ["C", "D", "E", "F", "G", "A", "B"];
let arpInterval = null;

function octavehz(hz, octave) {
  const val = parseFloat(octave);
  return hz * 2 ** val;
}

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

window.onload = function () {
  const audioContext = new AudioContext();

  function updateOscFrequency() {
    let selectedNoteButton = document.querySelector(
      "input[name='notechoice']:checked"
    );
    let selectedOctaveButton = document.querySelector(
      "input[name='octavechoice']:checked"
    );

    if (selectedNoteButton && selectedOctaveButton) {
      let selectedNote = selectedNoteButton.value;
      let selectedOctave = parseFloat(selectedOctaveButton.value);
      let noteFreq = noteToHz(selectedNote);
      let freqOctaveChoice = octavehz(noteFreq, selectedOctave);
      if (osc) {
        osc.frequency.setValueAtTime(
          freqOctaveChoice,
          audioContext.currentTime
        );
      }
    }
  }

  function handleWaveformSelectionChange() {
    let selectedRadioButton = document.querySelector(
      "input[name='wavechoice']:checked"
    );
    if (selectedRadioButton) {
      selectedWave = selectedRadioButton.value;
      if (osc) {
        osc.type = selectedWave;
      }
      console.log(selectedWave);
    } else {
      console.log("No radio button is selected.");
    }
  }

  document.querySelectorAll("input[name='notechoice']").forEach((rb) => {
    rb.addEventListener("change", updateOscFrequency);
  });

  document
    .querySelectorAll("input[name='wavechoice']")
    .forEach((radioButton) => {
      radioButton.addEventListener("change", handleWaveformSelectionChange);
    });

  document.querySelectorAll("input[name='octavechoice']").forEach((rb) => {
    rb.addEventListener("change", updateOscFrequency);
  });

  // handle keyboard
  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    switch (event.key) {
      // play/stop
      case "s":
        {
          if (osc) {
            osc.stop();
            osc = null;
          }
        }
        break;
      // "piano roll"
      case "1":
        selectNote("C");
        break;
      case "2":
        selectNote("D");
        break;
      case "3":
        selectNote("E");
        break;
      case "4":
        selectNote("F");
        break;
      case "5":
        selectNote("G");
        break;
      case "6":
        selectNote("A");
        break;
      case "7":
        selectNote("B");
        break;
      default:
        // If the key is not 1-7, do nothing
        break;
    }
  });

  function selectNote(note) {
    const radioButton = document.querySelector(
      `input[name='notechoice'][value='${note}']`
    );
    if (radioButton) {
      radioButton.checked = true;
      updateOscFrequency();
    } else {
      console.error(`Radio button for note ${note} not found`);
    }
  }

  // gain slider
  const gainSlider = document.getElementById("gain");
  const gainDisplay = document.getElementById("gainDisplay");
  gainSlider.addEventListener("input", () => {
    const level = parseFloat(gainSlider.value);
    console.log(level);
    gain.gain.setTargetAtTime(level, audioContext.currentTime, 0.01);
    gainDisplay.textContent = level;
  });

  // start button
  document.getElementById("start").addEventListener("click", () => {
    if (!osc) {
      osc = audioContext.createOscillator();
      console.log("new osc created!");
    }

    if (!gain) {
      gain = audioContext.createGain();
    }

    osc.type = selectedWave;
    osc.frequency.setValueAtTime(currentFreq, audioContext.currentTime);
    gain.gain.setTargetAtTime(
      parseFloat(gainSlider.value),
      audioContext.currentTime,
      0
    );
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    audioContext.resume();
  });

  // stop button
  document.getElementById("stop").addEventListener("click", () => {
    if (osc) {
      osc.stop();
      osc = null;
      if (arpInterval) {
        clearInterval(arpInterval);
        arpInterval = null;
      }
    } else {
      console.log("no osc to stop");
    }
  });

  // arp - work in progress
  function startArp() {
    if (!arpInterval) {
      baseNote = "C";
      let currentOctave = -2;
      if (osc) {
        arpInterval = setInterval(() => {
          if (currentOctave > 2) {
            currentOctave = -2;
          }

          let noteFreq = noteToHz(baseNote);
          let freqOctaveChoice = octavehz(noteFreq, currentOctave);
          osc.frequency.setValueAtTime(
            freqOctaveChoice,
            audioContext.currentTime
          );

          currentOctave++;
        }, 100);
      } else {
        console.log("no osc to run arp on");
      }
    }
  }

  document.getElementById("arp").addEventListener("click", startArp);
};
