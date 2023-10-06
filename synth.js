class Synth {
  constructor() {
    this.audioContext = new AudioContext();
    this.oscillators = [];
    this.gain = this.audioContext.createGain();
    this.gain.connect(this.audioContext.destination);
  }

  createOscillator(type = "sine", freq = 440) {
    const osc = this.audioContext.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    this.gain.gain.setTargetAtTime(0.5, this.audioContext.currentTime, 0);
    osc.connect(this.gain);
    this.gain.connect(this.audioContext.destination);
    this.oscillators.push(osc);
    return osc;
  }

  startOsc(osc) {
    osc.start();
  }

  stopOsc(osc) {
    osc.stop();
    const index = this.oscillators.indexOf(osc);
    if (index !== -1) {
      this.oscillators.splice(index, 1);
    }
  }

  stopAll() {
    for (let osc of this.oscillators) {
      this.stopOsc(osc);
    }
  }
}

function hzoctave(freq, octave) {
  return freq * 2 ** octave;
}

window.onload = function () {
  let synth = new Synth();
  let osc1 = synth.createOscillator("square", hzoctave(440, -1));
  let osc2 = synth.createOscillator("square", hzoctave(440, -1) - 2);
  // start button

  document.getElementById("activateVoice1").addEventListener("click", () => {
    console.log("voice 1 start clicked");
    synth.audioContext.resume();
    synth.startOsc(osc1);
  });

  document.getElementById("activateVoice2").addEventListener("click", () => {
    console.log("voice 2 start clicked");
    synth.audioContext.resume();
    synth.startOsc(osc2);
  });
};
