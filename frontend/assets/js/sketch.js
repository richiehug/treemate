// Treemate
// Richie Hug 2023

var currentScene;
var question, questionAudio, handReaderAudio, answerAudio;
var answers = [];
var debug = true;
let blockKeys = false;
var answerAChosen, answerBChosen;
let timerStarted = false;
var blockDelay = 2000;
var questionPlayed = false, answerPlayed = false, treeAudioPlayed = false, handReaderAudioPlayed = false;
var initialRun = true, quizFirstRun = true;
var answerAAudioLocation, answerBAudioLocation;
let startTime;
var maxIdleTime = 10 * 60 * 1000; // 5 minutes
let fileWriter;

let serial;

fetch("./assets/data/trees.json")
  .then(response => {
    return response.json();
  })
  .then(a => trees = a);
var treeId, treeIds, tree;

fetch("./assets/data/questions.json")
  .then(response => {
    return response.json();
  })
  .then(a => questions = a);

function preload() {
  // sounds
  backgroundAudio = loadSound('assets/audio/background.mp3');
  birdsAudio = loadSound('assets/audio/birds.mp3');
  questionAudio = loadSound('assets/audio/test.mp3');
  answerAudio = loadSound('assets/audio/answers/testAnswerA.mp3');
  handReaderAudio = loadSound('assets/audio/handReader.mp3');
  treeAudio = loadSound('assets/audio/test.mp3');
  buttonSound = loadSound('assets/audio/buttonSound.mp3');
  buttonSound.setVolume(0.3);

  // images
  intro = loadImage('assets/img/slides/intro.png');
  question = loadImage('assets/img/placeholders/1.png');
  matchFound = loadImage('assets/img/slides/matchFound.jpg');
  results = loadImage('assets/img/placeholders/9.png');
  a = loadImage('assets/img/a.png');
  b = loadImage('assets/img/b.png');

  // videos
  introVideo = createVideo('assets/video/introVideo.mp4');
  scanHand = createVideo('assets/video/scanHand.mp4');
  scanning = createVideo('assets/video/scanning.mp4');

  serial = new p5.SerialPort();
  serial.list();
  let options = { baudRate: 9600 };

  setTimeout(() => {
    serial.openPort("/dev/ttyACM0", options);
  }, 1000);
}

function setup() {
  startTime = millis();
  fileWriter = createWriter("assets/data/counter.txt"); 

  frameRate(24);
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;

  setVideo(introVideo);
  setVideo(scanHand);
  setVideo(scanning);
  background(0);

  introVideo.loop();

  introVideo.loop();

  answerAChosen = answerBChosen = false;
  answers = [];
  treeId = treeIds = null;
  timerStarted = false;

  questionPlayed = false;
  answerPlayed = false;
  treeAudioPlayed = false;
  handReaderAudioPlayed = false;
  quizFirstRun = true;
  avatarSpeaking = false;
  scanningVideoLoaded = false;

  createCanvas(width, height);
  currentScene = 0;

  console.clear();
}

function draw() {

  if (millis() - startTime >= maxIdleTime) {
    // Reload the browser window if too long idle
    window.location.reload();
  }


  if (initialRun && backgroundAudio.isLoaded() && birdsAudio.isLoaded()) {
    initialRun = false;
    backgroundAudio.loop();
    birdsAudio.loop();
    backgroundAudio.setVolume(0.16);
    birdsAudio.setVolume(0.1);
  }

  serial.write(currentScene);

  if (currentScene == 0) {
    image(introVideo, 0, 0, width, height);
    image(intro, 0, 0, width, height);
  }
  else if (currentScene > 0 && currentScene <= 5) {

    if (answerAudio.isLoaded() && !answerPlayed && !questionAudio.isPlaying()) {
      if (!quizFirstRun) answerAudio.play();
      quizFirstRun = false;
      answerPlayed = true;
    }
    if (questionAudio.isLoaded() && !questionPlayed && !answerAudio.isPlaying()) {
      questionAudio.play();
      questionPlayed = true;
    }

    image(question, 0, 0, width, height);

    if (answerAChosen) {
      image(a, 0, 0, width, height);
    } else if (answerBChosen) {
      image(b, 0, 0, width, height);
    }

  } else if (currentScene == 6) {
    if (handReaderAudio.isLoaded() && !handReaderAudioPlayed && !answerAudio.isPlaying()) {
      handReaderAudio.play();
      handReaderAudioPlayed = true;
      introVideo.stop();
      scanHand.loop();
    }
    image(scanHand, 0, 0, width, height);

  } else if (currentScene == 7) {
    // only do once
    if (!scanningVideoLoaded) {
      scanningVideoLoaded = true;
      scanHand.stop();
      scanning.loop();
    }
    image(scanning, 0, 0, width, height);
    if (timerStarted == false) skipToNextScene(5000);
  } else if (currentScene == 8) {
    image(matchFound, 0, 0, width, height);
    if (timerStarted == false) skipToNextScene(2000);
  } else if (currentScene == 9) {
    if (treeAudio.isLoaded() && !treeAudioPlayed) {
      treeAudio.play();
      treeAudioPlayed = true;
      scanning.stop();
    }
    if (treeId != null) image(treeImage, 0, 0, width, height);
  }
}

function windowResized() {
  setup();
}

function keyPressed() {

  if (keyCode == 70 || keyCode == 78 || keyCode == 80 || keyCode == 65 || keyCode == 66 || keyCode == 82) {
    startTime = millis();
    if (questionAudio.isPlaying()) questionAudio.stop();
    if (answerAudio.isPlaying()) answerAudio.stop();
    if (treeAudio.isPlaying()) treeAudio.stop();
    if (handReaderAudio.isPlaying()) handReaderAudio.stop();
    avatarSpeaking = false;
    treeAudioPlayed = false;
    addLog(null, key);
  }

  if (blockKeys) {
    return; // if keys are blocked, do nothing
  }
  if (keyCode == 70) {
    // f key
    let fs = fullscreen();
    fullscreen(!fs);
  } else if (keyCode == 78 && debug == true) {
    // n key
    if (currentScene == 9) setup();
    else {
      if (currentScene < 5) updateQuestionData((currentScene + 1).toString());
      if (currentScene == 8) {
        treeId = getTreeId();
        tree = findTreeById(trees, treeId);
      }
      setTimeout(() => {
        nextScene(key);
      }, 200);
    }
  } else if (keyCode == 80 && debug == true) {
    // p key
    if (currentScene > 1) updateQuestionData((currentScene - 1).toString());
    if (currentScene > 0) {
      console.log(key);
      currentScene -= 1;
      console.log("New scene: " + currentScene);
    }
  } else if (keyCode == 65 || keyCode == 66) {
    // a or b key
    if (currentScene == 0 || currentScene == 9) {
      // playButtonSound();
      blockKeys = true;
      if (currentScene == 0) {
        updateQuestionData((currentScene + 1).toString());
        nextScene(key);
      } else {
        setup();
      }
      setTimeout(() => {
        blockKeys = false;
        answerAChosen = answerBChosen = false;
      }, blockDelay);
    } else if (currentScene > 0 && currentScene <= 5) {
      playButtonSound();
      blockKeys = true;
      addAnswer(key);
      keyCode === 65 ? answerAChosen = true : answerBChosen = true;
      nextScene(key, blockDelay);
      setTimeout(() => {
        blockKeys = false; // unblock keys after 3 seconds
        updateQuestionData((currentScene).toString());
        answerAChosen = answerBChosen = false;
      }, blockDelay);
    }
  } else if (keyCode == 67) {
    // c key; Hand scan
    if (currentScene == 6) {
      playButtonSound();
      nextScene(key);
    }
  }
  else if (keyCode == 82) {
    // r key
    location.reload(true);
  }
}

function setVideo(video) {
  video.volume(0);
  video.size(width, height);
  video.hide();
}

function nextScene(key = null, delay = null) {

  console.log("Key pressed: " + key);
  if (delay == null) {
    currentScene += 1;
    if (currentScene == 1) quizFirstRun = true;
    console.log("New scene: " + currentScene);
    sendCurrentScene();
  } else {
    setTimeout(() => {
      currentScene += 1;
      if (currentScene == 1) quizFirstRun = true;
      console.log("New scene: " + currentScene);
      sendCurrentScene();
    }, delay);
  }
}

function addAnswer(key) {
  if (currentScene > 0 && currentScene <= 5) {
    answers[currentScene - 1] = key;
    if (key == 'a') answerAudio = loadSound(answerAAudioLocation);
    else answerAudio = loadSound(answerBAudioLocation);
    answerPlayed = false;
  }
}

function getTreeId() {
  if (
    Array.isArray(answers) &&
    answers.length === 5 &&
    answers.every((answer) => typeof answer === 'string')
  ) {
    const matchingTree = trees.find((tree) =>
      tree.answers.every((answer, index) => answer === answers[index])
    );

    addLog(answers);

    return matchingTree ? matchingTree.id : null;
  } else {
    return null;
  }
}

function findTreeById(trees, id) {
  let foundTree = trees.find(tree => tree.id === id);

  if (foundTree) {
    foundTree.audio = loadSound(foundTree.audioLocation);
    foundTree.image = loadImage(foundTree.imageLocation);
  }

  return foundTree;
}

function getRandomPosition(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return randomIndex;
}

function updateQuestionData(type) {
  // Find all questions that match the specified type
  const matchingQuestions = questions.filter(q => q.question.type === type);

  // Select a random question from the matching questions
  const randomQuestion = matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];

  // Check if randomQuestion exists before trying to access its properties
  if (randomQuestion && randomQuestion.question) {
    question = loadImage(randomQuestion.question.questionImage);
    questionAudio = loadSound(randomQuestion.question.questionAudio);
    answerAAudioLocation = randomQuestion.question.answerAAudio;
    answerBAudioLocation = randomQuestion.question.answerBAudio;
    questionPlayed = false;
  }
}

function skipToNextScene(delay) {
  timerStarted = !timerStarted;
  console.log("skipping in " + delay + "ms");
  if (currentScene == 8) {
    treeId = getTreeId();
    tree = findTreeById(trees, treeId);
    treeAudio = tree == null ? loadSound('assets/audio/test.mp3') : loadSound(tree.audioLocation);
    treeImage = loadImage(tree.imageLocation);
  }
  setTimeout(() => {
    timerStarted = !timerStarted;
    console.log("skipping now");
    nextScene();
  }, delay);
}

function sendCurrentScene() {
  if (serial.serialport) {
    serial.write(currentScene);
    console.log("Sent currentScene:", currentScene);
    // serial.close(); // Close the port
  } else {
    console.log("Error: port not open!");
  }
}

function intToByteArray(intValue) {
  let byteArray = new Uint8Array(2);
  byteArray[0] = (intValue >> 8) & 0xFF;
  byteArray[1] = intValue & 0xFF;
  return byteArray;
}

function playButtonSound() {
  buttonSound.play();
}

function addLog(answers = '', key = '') {
  const data = {
    answers,
    key // Add the key to the data object
  };

  fetch('http://localhost:3000/addLog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        return response.text(); // Get the log message from the response
      } else {
        throw new Error('Error adding log');
      }
    })
    .then(logMessage => {
      console.log('Log added:', logMessage); // Print the log message to the browser console
    })
    .catch(error => {
      console.error(error);
    });
}