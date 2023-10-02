let osc = null;
let gain = null;
let selectedWave = "square";
let baseFreq = 440;
let currentFreq = 261.63;

function octavehz(hz, octave) {
  const val = parseFloat(octave);
  return hz * 2 ** val;
}

function noteToHz(note) {
  switch (note) {
    case "C":
      return 261.63;
    case "D":
      return 269.66;
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
  }
}

window.onload = function () {
  const audioContext = new AudioContext();

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

  function handleOctaveSelectionChange() {
    let selectedRadioButton = document.querySelector(
      "input[name='octavechoice']:checked"
    );
    if (selectedRadioButton) {
      selectedOctave = parseFloat(selectedRadioButton.value);
      if (osc) {
        newFreq = octavehz(currentFreq, selectedOctave);
        console.log("selected base frequency " + newFreq);
        osc.frequency.setValueAtTime(newFreq, audioContext.currentTime);
      }
    } else {
      console.log("No radio button is selected.");
    }
  }

  function handleNoteChange() {
    let selectedRadioButton = document.querySelector(
      "input[name='notechoice']:checked"
    );
    if (selectedRadioButton) {
      selectedNote = selectedRadioButton.value;
      console.log(selectedNote);
      if (osc) {
        currentFreq = noteToHz(selectedNote);
        osc.frequency.setValueAtTime(currentFreq, audioContext.currentTime);
      }
      console.log(octavehz(baseFreq, selectedOctave));
    } else {
      console.log("No radio button is selected.");
    }
  }

  document.querySelectorAll("input[name='notechoice']").forEach((rb) => {
    rb.addEventListener("change", handleNoteChange);
  });

  document
    .querySelectorAll("input[name='wavechoice']")
    .forEach((radioButton) => {
      radioButton.addEventListener("change", handleWaveformSelectionChange);
    });

  document.querySelectorAll("input[name='octavechoice']").forEach((rb) => {
    rb.addEventListener("change", handleOctaveSelectionChange);
  });

  const gainSlider = document.getElementById("gain");
  const gainDisplay = document.getElementById("gainDisplay");
  gainSlider.addEventListener("input", () => {
    const level = parseFloat(gainSlider.value);
    console.log(level);
    gain.gain.setTargetAtTime(level, audioContext.currentTime, 0.01);
    gainDisplay.textContent = level;
  });

  document.getElementById("start").addEventListener("click", () => {
    if (!osc) {
      osc = audioContext.createOscillator();
      console.log("new osc created!");
    }

    if (!gain) {
      gain = audioContext.createGain();
    }

    console.log(selectedWave);
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

  document.getElementById("stop").addEventListener("click", () => {
    osc.stop();
    osc = null;
  });
};
