// Treemate
// Richie Hug 2023

var currentScene, lastScene;
var title, question, answerA, answerB, questionAudio, handReaderAudio, answerAudio;
var answers = [];
var answerAImg, answerBImg;
var debug = true;
var vid;
let blockKeys = false;
var scaleFactorA, scaleFactorB;
let timerStarted = false;
var blockDelay = 1300;
let scanTime = 3000;
var titleSize, questionSize, answerSize, leadingSize, pSize;
var opacity = 120;
let goingUp = false;
var questionPlayed = false;
var answerPlayed = false;
var treeAudioPlayed = false;
var handReaderAudioPlayed = false;
var quizFirstRun = true;
var answerAAudioLocation, answerBAudioLocation, qrCode;
let initialRun = true;
let avatarSpeaking = false;
var treeImage, treeVisuals, treeVid;

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
  customFont = loadFont('assets/font/IndieFlower-Regular.ttf');
  avatar = loadImage('assets/img/avatar.jpg');
  a = loadImage('assets/img/a.png');
  b = loadImage('assets/img/b.png');
  hand = loadImage('assets/img/hand.png');
  // handBackground = loadImage('assets/img/handBackground.png');
  treeImage = loadImage('assets/img/a.png');

  backgroundAudio = loadSound('assets/audio/background.mp3');
  birdsAudio = loadSound('assets/audio/birds.mp3');
  questionAudio = loadSound('assets/audio/test.mp3');
  answerAudio = loadSound('assets/audio/answers/testAnswerA.mp3');
  handReaderAudio = loadSound('assets/audio/handReader.mp3');
  treeAudio = loadSound('assets/audio/results/testTreeAudio.mp3');
  qrCode = loadImage('assets/img/qrCodeExample.png');
  buttonSound = loadSound('assets/audio/buttonSound.mp3');
  buttonSound.setVolume(0.3);

  // avatarUnanimated = loadGif('assets/img/avatarUnanimated.gif');
  // avatarAnimated = loadGif('assets/img/avatarAnimated.gif');
  avatarUnanimated = loadGif('assets/img/faceUnanimated.gif');
  avatarAnimated = loadGif('assets/img/faceAnimated.gif');
  backgroundLines = loadImage('assets/img/backgroundLines.png');
}

function setup() {
  textFont(customFont);
  width = document.documentElement.clientWidth;
  height = document.documentElement.clientHeight;
  scaleFactorA = scaleFactorB = 1;
  answers = [];
  treeId = treeIds = null;
  lastScene = null;
  timerStarted = false;

  vid = createVideo('assets/video/introVideo.mov');
  vid.volume(0);
  vid.size(width, height);
  vid.position(0, 0);
  vid.style('object-fit', 'cover');
  vid.style('object-position', 'center');
  vid.style('z-index', '-1');
  vid.loop();
  vid.hide();

  questionPlayed = false;
  answerPlayed = false;
  treeAudioPlayed = false;
  handReaderAudioPlayed = false;
  quizFirstRun = true;
  avatarSpeaking = false;

  serial = new p5.SerialPort();
  serial.list();
  let options = { baudRate: 9600 };

  setTimeout(() => {
    serial.openPort("/dev/cu.usbmodem14202", options);
  }, 1000);

  createCanvas(width, height);
  currentScene = 0;

  // debug
  // answers = ['a','a','a','a','a'];
  // treeId = getTreeId();
  // tree = findTreeById(trees, treeId);
  // updateQuestionData(currentScene.toString());
  // currentScene = 9;

  console.clear();
}

function draw() {
  if (initialRun && backgroundAudio.isLoaded() && birdsAudio.isLoaded()) {
    initialRun = false;
    backgroundAudio.loop();
    birdsAudio.loop();
    backgroundAudio.setVolume(0.16);
    birdsAudio.setVolume(0.1);
  }

  serial.write(currentScene);
  background(0);
  fill(255);
  if (document.documentElement.clientWidth > document.documentElement.clientHeight) {
    titleSize = height / 6;
    subtitleSize = height / 20;
    leadingSize = height / 25;
    pSize = height / 35;
    answerSize = height / 30;
  }
  else {
    titleSize = width / 8;
    subtitleSize = width / 20;
    leadingSize = width / 25;
    pSize = width / 35;
    answerSize = width / 30;
  }
  textAlign(CENTER);

  // Scene Handler

  textAlign(CENTER, TOP);
  textSize(titleSize); // fallback
  translate(width / 2, 0);

  if (treeAudio.isPlaying() || questionAudio.isPlaying() || answerAudio.isPlaying()) avatarSpeaking = true;
  else avatarSpeaking = false;
  var backgroundScale = sin(0.02 * frameCount) * 0.02;

  if (currentScene == 0) {

    var title = "Treemate";
    var subtitle = "Let the tree oracle reveal what tree you would be, if you were a tree in Piemonte. \n\nPress [A] or [B] to start!";
    var video = vid.get();

    push();
    noStroke();
    rectMode(CENTER);
    image(video, -width / 2, 0);
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();
    translate(0, height / 2);

    fill(255, 200);
    rect(0, 0, width * 2 / 3, height * 2 / 3);

    fill(0);
    textAlign(CENTER, CENTER);

    textSize(titleSize);

    push();
    blendMode(DARKEST); // Use the darkest pixel color
    fill(255, 255, 255, 0); // Set the fill color to transparent white
    rect(-width / 20, -height / 3.5, width / 10, width / 10); // Draw a transparent white rectangle over the image
    blendMode(BLEND); // Reset the blend mode to the default
    pop();

    push();
    var avatarSize = document.documentElement.clientWidth > document.documentElement.clientHeight ? height / 4 : width / 4;
    translate(-avatarSize / 2, -avatarSize);
    image(avatarUnanimated, 0, 0, avatarSize, avatarSize);
    pop();

    fill(180);
    text(title, 5, -height / 20+5, width * 2 / 3, height * 2 / 3);
    fill(0);
    text(title, 0, -height / 20, width * 2 / 3, height * 2 / 3);
    textSize(leadingSize);
    text(subtitle, 0, height / 10, width * 1.9 / 3, height * 2 / 3);
    pop();

  } else if (currentScene > 0 && currentScene <= 5) {

    if (answerAudio.isLoaded() && !answerPlayed && !questionAudio.isPlaying()) {
      if (!quizFirstRun) answerAudio.play();
      quizFirstRun = false;
      answerPlayed = true;
    }
    if (questionAudio.isLoaded() && !questionPlayed && !answerAudio.isPlaying()) {
      questionAudio.play();
      questionPlayed = true;
    }

    var squareSize = document.documentElement.clientWidth > document.documentElement.clientHeight ? height * 0.45 : width * 0.45;
    var spacing = document.documentElement.clientWidth > document.documentElement.clientHeight ? height * 0.1 : width * 0.1;
    var avatarSize = document.documentElement.clientWidth > document.documentElement.clientHeight ? height * 0.25 : width * 0.25;

    push();
    translate(0, 0);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    imageMode(CENTER);
    textSize(subtitleSize);

    // background
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();

    // question
    push();
    translate(0, height / 10);
    fill(255);
    rect(0, height / 60, width - width / 10, height / 6);
    fill(0);
    text(question, 0, 0, width - width / 8, height / 8);
    pop();

    // answers
    textSize(answerSize);
    push();
    translate(-width / 4, height / 2);
    fill(255);
    image(answerAImg, 0, 0, squareSize, squareSize);
    translate(0, squareSize / 2);
    image(a, 0, 0, spacing * scaleFactorA, spacing * scaleFactorA);
    translate(0, spacing * 3 / 2);
    fill(255);
    rect(0, height / 80, squareSize, height / 10);
    fill(0);
    text(answerA, 0, 0, squareSize, height / 8);
    pop();

    push();
    translate(width / 4, height / 2);
    fill(255);
    image(answerBImg, 0, 0, squareSize, squareSize);
    translate(0, squareSize / 2);
    image(b, 0, 0, spacing * scaleFactorB, spacing * scaleFactorB);
    translate(0, spacing * 3 / 2);
    fill(255);
    rect(0, height / 80, squareSize, height / 10);
    fill(0);
    text(answerB, 0, 0, squareSize, height / 8);
    pop();

    // tree avatar
    push();
    translate(0, height / 2);
    if (!avatarSpeaking) image(avatarUnanimated, 0, 0, avatarSize, avatarSize);
    else image(avatarAnimated, 0, 0, avatarSize, avatarSize);
    // var video = vid.get();
    // image(video,0,0,avatarSize,avatarSize);
    pop();

    pop();

  } else if (currentScene == 6) {
    if (
      handReaderAudio.isLoaded() && !handReaderAudioPlayed && !answerAudio.isPlaying()) {
      handReaderAudio.play();
      handReaderAudioPlayed = true;
    }
    push();

    // background
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();

    translate(0, height / 2);
    rectMode(CENTER);
    imageMode(CENTER);
    // image(handBackground, 0, 0, avatarSize, avatarSize);
    if (opacity == 255 || opacity == 0) goingUp = !goingUp;
    opacity = goingUp ? opacity + 5 : opacity - 5;
    // background(abs(128 - opacity));
    rect(0, 0, avatarSize, avatarSize);
    textAlign(CENTER, CENTER);
    tint(255, abs(opacity - 128));
    image(hand, 0, 0, avatarSize, avatarSize);
    fill(255);
    title = "scan your hand";
    text(title, 0, 0, width - width / 10, height / 2);
    subtitle = "hover your hand on top of the reader";
    textSize(subtitleSize);
    text(subtitle, 0, height / 6, width - width / 10, height / 2);
    pop();
  } else if (currentScene == 7) {
    push();

    // background
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();

    translate(0, height / 2);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    imageMode(CENTER);
    title = "scanning trees";
    // rect(0,0,width-width/10, height / 2);
    text(title, 0, 0, width - width / 10, height / 2);
    pop();
    if (timerStarted == false) skipToNextScene(2000);
  } else if (currentScene == 8) {
    push();

    // background
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();

    translate(0, height / 2);
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    imageMode(CENTER);
    title = "treemate found";
    // rect(0,0,width-width/10, height / 2);
    text(title, 0, 0, width - width / 10, height / 2);
    pop();
    if (timerStarted == false) skipToNextScene(2000);
  } else if (currentScene == 9) {
    if (treeAudio.isLoaded() && !treeAudioPlayed) {
      treeAudio.play();
      treeAudioPlayed = true;
    }
    if (tree.visualType == 'video') var treeVideo = treeVid.get();
    push();

    // background
    push();
    translate(0, height / 2);
    imageMode(CENTER);
    image(backgroundLines, 0, 0, width * 2 * (backgroundScale + 1), height * 2 * (backgroundScale + 1));
    pop();

    translate(-width / 2, 0);
    textAlign(LEFT, TOP);
    rectMode(CORNER);
    // imageMode(CENTER);
    textSize(subtitleSize);
    text('Your tree match', width / 30, height / 30, width, height / 10);
    push();
    if (treeId != null) {
      textAlign(LEFT, TOP);
      textSize(titleSize);
      text(tree.name, width / 30, height / 20, width - width / 20, height / 3 - height / 20);
      textSize(pSize);
      text(tree.description, width / 20, height / 3.5, width - width * 2 / 5, height / 2.2);
      fill(255);
      // rect(width - width * 1.5 / 5, height / 3.5, width * 2 / 5, height / 2.2);
      if (tree.visualType == 'video') {
        image(treeVideo, width - width * 1.5 / 5, height / 3.5, width * 2 / 5, height / 2.2);
      }
      else if (tree.visualType == 'image') {
        image(treeImage, width - width * 1.5 / 5, height / 3.5, width * 2 / 5, height / 2.2);
      }
    }
    else {
      textSize(titleSize);
      translate(width / 10, 0);
      textAlign(LEFT, CENTER);
      // translate(width/3,height/3);
      text("Nothing found", 0, 0, width, height);
    }
    pop();
    textAlign(CENTER, CENTER);
    fill(255);
    rect(width / 19, height - height / 8, width * 0.4, height / 9);
    fill(0);
    text('Press [A] or [B] to Restart', width / 20, height - height / 8, width * 0.4, height / 9);
    if (treeId != null) {
      fill(255);
      rect(width / 19, height - height / 8, width * 0.4, height / 9);
      fill(0);
      text('Press [A] or [B] to Restart', width / 20, height - height / 8, width * 0.4, height / 9);
      textAlign(CENTER, CENTER);
      fill(255);
      rect(width / 19 + width / 2, height - height / 8, width * 0.4, height / 9);
      fill(0);
      text('Share on Twitter', width / 20 + width / 2, height - height / 8, width * 0.4, height / 9);
      image(qrCode, width / 20 + width / 2 + width * 0.4 - height / 9, height - height / 8, height / 9, height / 9);
    }
    pop();
  };
}

function windowResized() {
  setup();
}

function keyPressed() {

  if (keyCode == 70 || keyCode == 78 || keyCode == 80 || keyCode == 65 || keyCode == 66 || keyCode == 82) {
    if (questionAudio.isPlaying()) questionAudio.stop();
    if (answerAudio.isPlaying()) answerAudio.stop();
    if (treeAudio.isPlaying()) treeAudio.stop();
    if (handReaderAudio.isPlaying()) handReaderAudio.stop();
    avatarSpeaking = false;
    treeAudioPlayed = false;
  }
  // handReaderAudioPlayed = false;

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
      } else setup();
      setTimeout(() => {
        blockKeys = false; // unblock keys after 3 seconds
        // updateQuestionData((currentScene).toString());
        scaleFactorA = scaleFactorB = 1;
      }, blockDelay);
    } else if (currentScene > 0 && currentScene <= 5) {
      playButtonSound();
      blockKeys = true;
      addAnswer(key);
      keyCode === 65 ? scaleFactorA = 1.2 : scaleFactorB = 1.2;
      nextScene(key, blockDelay);
      setTimeout(() => {
        blockKeys = false; // unblock keys after 3 seconds
        updateQuestionData((currentScene).toString());
        scaleFactorA = scaleFactorB = 1;
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
    console.log("Reset");
    if (backgroundAudio.isPlaying()) backgroundAudio.stop();
    if (birdsAudio.isPlaying()) birdsAudio.stop();
    initialRun = true;
    setup();
  }
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

// function filterTrees(trees, answers) {
//   return trees.filter(tree => {
//     return tree.answers.every((availableTrees, index) => {
//       return availableTrees === answers[index];
//     });
//   });
// }

// function getTreeId() {
//   if (Array.isArray(answers) && answers.length === 5 && answers.every(answer => typeof answer === 'string')) {
//     const treeId = answers.reduce((id, answer) => id + answer.charCodeAt(0), 0) % 4;
//     return treeId;
//   } else {
//     return null;
//   }
// }

function getTreeId() {
  if (
    Array.isArray(answers) &&
    answers.length === 5 &&
    answers.every((answer) => typeof answer === 'string')
  ) {
    const matchingTree = trees.find((tree) =>
      tree.answers.every((answer, index) => answer === answers[index])
    );

    return matchingTree ? matchingTree.id : null;
  } else {
    return null;
  }
}

function findTreeById(trees, id) {
  let foundTree = trees.find(tree => tree.id === id);

  if (foundTree) {
    foundTree.treeAudio = loadSound(foundTree.audioLocation);
    foundTree.treeQr = loadImage(foundTree.qrCodeLocation);
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
    // Update the global variables with the selected question's title and answers
    question = randomQuestion.question.title;
    answerA = randomQuestion.question.answerA;
    answerB = randomQuestion.question.answerB;
    answerAImg = loadImage(randomQuestion.question.answerALocation);
    answerBImg = loadImage(randomQuestion.question.answerBLocation);
    questionAudio = loadSound(randomQuestion.question.questionAudio);
    answerAAudioLocation = randomQuestion.question.answerAAudio;
    answerBAudioLocation = randomQuestion.question.answerBAudio;
    questionPlayed = false;
    // if (randomQuestion.question.visualType == 'video') {
    //   treeVid = createVideo(randomQuestion.question.visualLocation);
    //   console.log(randomQuestion.question.visualLocation);
    //   treeVid.volume(0);
    //   treeVid.loop();
    //   treeVid.hide();
    // }
    // else if (randomQuestion.question.visualType == 'image') {
    //   treeImage = loadImage(randomQuestion.question.visualLocation);
    // }
  }
}

function skipToNextScene(delay) {
  timerStarted = !timerStarted;
  console.log("skipping in " + delay + "ms");
  if (currentScene == 8) {
    treeId = getTreeId();
    tree = findTreeById(trees, treeId);
    treeAudio = tree == null ? loadSound('assets/audio/testTreeAudio.mp3') : loadSound(tree.audioLocation);
    qrCode = tree == null ? loadImage('assets/audio/qrCodeExample.png') : loadImage(tree.qrCodeLocation);
    if (tree.visualType == 'image') {
      treeImage = loadImage(tree.visualLocation);
    } else if (tree.visualType == 'video') {
      treeVid = createVideo(tree.visualLocation);
      treeVid.volume(0);
      treeVid.loop();
      treeVid.hide();
    }
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