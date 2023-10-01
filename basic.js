let osc = null;
let gain = null;

window.onload = function () {
  let selectedWave = document.querySelector(
    "input[name='wavechoice']:checked"
  ).value;

  const audioContext = new AudioContext();
  // this gets the node for the start butten and adds to it an even listener for click, when clicked the synth will play

  const freqSlider = document.getElementById("freq");
  const freqDisplay = document.getElementById("freqDisplay");
  freqSlider.addEventListener("input", () => {
    const freq = parseFloat(freqSlider.value);
    osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    freqDisplay.textContent = freq;
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
    }

    if (!gain) {
      gain = audioContext.createGain();
    }

    osc.type = "" + selectedWave;
    osc.frequency.setValueAtTime(
      parseFloat(freq.value),
      audioContext.currentTime
    );
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

  function handleSelectionChange() {
    let selectedValue = document.querySelector(
      'input[name="choice"]:checked'
    ).value;
    console.log(selectedValue);
  }

  document.querySelectorAll("input[name='wavechoice']").forEach((rb) => {
    rb.addEventListener("change", handleSelectionChange);
  });
};
