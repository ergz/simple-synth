window.onload = function () {
  const audioContext: AudioContext = new AudioContext();
  const osc: OscillatorNode = audioContext.createOscillator();

  // this gets the node for the start butten and adds to it an even listener for click, when clicked the synth will play
  document.getElementById("play")!.addEventListener("click", () => {
    audioContext.resume();
  });

  osc.type = "square";
  osc.frequency.setValueAtTime(220, audioContext.currentTime);
  osc.connect(audioContext.destination);
  osc.start();
};
