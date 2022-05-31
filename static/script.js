/* eslint-disable @typescript-eslint/no-unused-vars */
const WHITE_KEYS = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"];
const BLACK_KEYS = ["w", "e", "t", "y", "u", "o", "p"];
const noteDict = {};

const keys = document.querySelectorAll(".key");
const whiteKeys = document.querySelectorAll(".key.white");
const blackKeys = document.querySelectorAll(".key.black");
const socket = io("/");

getNotes("accordion");

const socketPlayEvent = (message) => {
  selectElement = document.querySelector("#instrument");
  const inst = selectElement.value;
  socket.emit("ThereminiClient", `${inst}-${message}-1.0`);
};

const socketPauseEvent = (message) => {
  selectElement = document.querySelector("#instrument");
  const inst = selectElement.value;
  socket.emit("ThereminiClient", `${inst}-${message}-pause`);
};

let clicked = false;
keys.forEach((key) => {
  key.addEventListener("mousedown", () => {
    socketPlayEvent(key.id.split("-")[1]);
    clicked = true;
  });
  key.addEventListener("mouseenter", () => {
    if (clicked) {
      socketPlayEvent(key.id.split("-")[1]);
    }
  });
  key.addEventListener("mouseup", () => {
    socketPauseEvent(key.id.split("-")[1]);
    clicked = false;
  });
  key.addEventListener("mouseleave", () => {
    if (clicked) {
      socketPauseEvent(key.id.split("-")[1]);
    }
  });
});

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const whiteKeyIndex = WHITE_KEYS.indexOf(e.key);
  const blackKeyIndex = BLACK_KEYS.indexOf(e.key);
  if (whiteKeyIndex > -1)
    socketPlayEvent(whiteKeys[whiteKeyIndex].id.split("-")[1]);
  if (blackKeyIndex > -1)
    socketPlayEvent(blackKeys[blackKeyIndex].id.split("-")[1]);
});

document.addEventListener("keyup", (e) => {
  if (e.repeat) return;
  const whiteKeyIndex = WHITE_KEYS.indexOf(e.key);
  const blackKeyIndex = BLACK_KEYS.indexOf(e.key);
  if (whiteKeyIndex > -1)
    socketPauseEvent(whiteKeys[whiteKeyIndex].id.split("-")[1]);
  if (blackKeyIndex > -1)
    socketPauseEvent(blackKeys[blackKeyIndex].id.split("-")[1]);
});

function getNote(note) {
  if (note in noteDict) return noteDict[note];
  noteDict[note] = new Audio(
    `notes/${note.split("-")[0]}-mp3/${note.split("-")[1]}.mp3`
  );
  return noteDict[note];
}

function getNotes(inst) {
  for (const key of "A0 A1 A2 A3 A4 A5 A6 A7 Ab1 Ab2 Ab3 Ab4 Ab5 Ab6 Ab7 B0 B1 B2 B3 B4 B5 B6 B7 Bb0 Bb1 Bb2 Bb3 Bb4 Bb5 Bb6 Bb7 C1 C2 C3 C4 C5 C6 C7 C8 D1 D2 D3 D4 D5 D6 D7 Db1 Db2 Db3 Db4 Db5 Db6 Db7 E1 E2 E3 E4 E5 E6 E7 Eb1 Eb2 Eb3 Eb4 Eb5 Eb6 Eb7 F1 F2 F3 F4 F5 F6 F7 G1 G2 G3 G4 G5 G6 G7 Gb1 Gb2 Gb3 Gb4 Gb5 Gb6 Gb7".split(
    " "
  )) {
    const note = `${inst}-${key}`;
    getNote(note);
  }
}

function playNote(note) {
  const key = document.getElementById(`key-${note.split("-")[1]}`);

  const noteAudio = getNote(note.split("-").slice(0, -1).join("-"));
  noteAudio.currentTime = 0;
  noteAudio.volume = parseFloat(note.split("-")[2]);
  noteAudio.play();

  key.classList.add("active");
  noteAudio.addEventListener("ended", () => {
    key.classList.remove("active");
  });
}

function pauseNote(note) {
  const key = document.getElementById(`key-${note.split("-")[1]}`);
  const noteAudio = getNote(note.slice(0, -6));
  noteAudio.pause();
  key.classList.remove("active");
}

var app = new Vue({
  el: "#v-app",
  methods: {
    receiveMessage(msg) {
      try {
        console.log(`recv: ${msg}`);
        if (msg.split("-").length < 2) {
          getNotes(msg);
        } else if (msg.split("-")[2] === "pause") {
          pauseNote(msg);
        } else {
          playNote(msg);
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  created() {
    socket.on("ThereminiServer", (msg) => {
      this.receiveMessage(msg);
    });
  },
});
