let osc: OscillatorNode;
let gain: GainNode;
let selectedWave: string = "square";
let baseFreq: number = 440;
let currentFreq: number = 261.63;

function octavehz(hz: number, octave: string): number {
  const val = parseFloat(octave);
  return hz * 2 ** val;
}

function noteToHz(note: string): number | undefined {
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

  function updateOscFrequency() {
    let selectedNoteButton = document.querySelector(
      "input[name='notechoice']:checked"
    );
    console.log("note choice changed to: " + selectedNoteButton.value);
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

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
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

  document.getElementById("arp").addEventListener("click", () => {
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    for (let i = 0; i < notes.length; i++) {
      for (let j = 0; j < 1000; j++) {
        let x = 100;
      }
      console.log(notes[i]);
      osc.frequency.setValueAtTime(
        noteToHz(notes[i]),
        audioContext.currentTime
      );
    }
  });
};
