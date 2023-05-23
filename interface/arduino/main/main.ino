#include "PluggableUSBHID.h"
#include "USBKeyboard.h"
#include "Ultrasonic.h"
#include <Adafruit_NeoPixel.h>

USBKeyboard Keyboard;

// const int buttonCPin = 7; // C button / OK
const int buttonAPin = 5; // A button
const int buttonBPin = 6; // B button
const int buttonDPin = 10; // D button

int lastButtonState[3] = { LOW, LOW, LOW }; // previous state of buttons
boolean isButtonPressed[3] = { false, false, false }; // is each button currently pressed down?
const int letterOffsets[3] = { 0, 1, 2 }; // ASCII code offset for each letter

// define the trigger and echo pins for the ultrasonic sensor
const int triggerPin = 11;
const long distanceThreshold = 10; // distance treshold in cm
int distanceTimer = 0;
bool closeTimerStarted = false;
unsigned long closeTimerStart;

bool fadeDirection = true;  // true for fading out, false for fading in
static unsigned long lastUpdateTime = 0;
static unsigned long blinkLastTime = 0;
static unsigned long currentTime = 0;
static int brightness = 100;
static int brightnessMin = 1;
static int brightnessMax = 255;
static int fadeAmount = 1;
static int interval = 100;
int currentScene = 0;
int something;
int sceneLastChecked = 0;
int updateInterval = 5;

// Neopixel
#define PIXEL_COUNT 24
#define PIXEL_PIN_A 6
#define PIXEL_PIN_B 15
#define PIXEL_PIN_HAND 16

Adafruit_NeoPixel ledRingA = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN_A, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel ledRingB = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN_B, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel ledRingHand = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN_HAND, NEO_GRB + NEO_KHZ800);

Adafruit_NeoPixel* pixelsAll[] = { &ledRingA, &ledRingB, &ledRingHand };
Adafruit_NeoPixel* pixelsButtons[] = { &ledRingA, &ledRingB };
Adafruit_NeoPixel* pixelsHand[] = { &ledRingHand };

// create an Ultrasonic object with the trigger pin
Ultrasonic ultrasonic(triggerPin);

void setup() {
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  // make the button pins inputs with pull-up resistors:
  pinMode(buttonAPin, INPUT_PULLUP);
  pinMode(buttonBPin, INPUT_PULLUP);

  // set the trigger pin as an output:
  pinMode(triggerPin, OUTPUT);

  ledRingA.begin();
  ledRingA.setBrightness(brightness);
  ledRingB.begin();
  ledRingB.setBrightness(brightness);
  ledRingHand.begin();
  ledRingHand.setBrightness(brightness);
  // Set all pixels to white
  for (int i = 0; i < PIXEL_COUNT; i++) {
    ledRingA.setPixelColor(i, 255, 255, 255);
    ledRingB.setPixelColor(i, 255, 255, 255);
    ledRingHand.setPixelColor(i, 255, 255, 255);
  }
  ledRingA.show();
  ledRingB.show();
  ledRingHand.show();
  unsigned long startTime = millis();
  while (millis() - startTime < 2000) {
    // Wait for one second
  }
  Keyboard.printf("r");
}

void loop() {
  // process each button
  processButton(0, digitalRead(buttonAPin));
  processButton(1, digitalRead(buttonBPin));

  // read the distance from the ultrasonic sensor:
  long distance = ultrasonic.read();

  currentTime = millis();

  if (distance >= 0 && distance < distanceThreshold && currentScene == 6) {
    // trigger the 'D' key:
    Serial.println("distance (close): " + String(distance));
    if (!closeTimerStarted) {
      // start the timer
      Serial.println("Resetting timer...");
      closeTimerStarted = true;
      closeTimerStart = millis();
      updateInterval = 2;
    } else if (millis() - closeTimerStart >= 3000) {
      Serial.println("Timer over...");
      // distance has been close for at least 3 seconds, trigger the function
      //processButton(2, HIGH);
      //processButton(2, LOW);
      pixelsBlink(ledRingHand);
      Keyboard.printf("c");
      // reset the timer
      closeTimerStarted = false;
    }
  } else {
    // Serial.println("distance (far): " + String(distance));
    // reset the timer
    closeTimerStarted = false;
    updateInterval = 5;
  }

  // Read integer value from Serial port
  if (Serial.available() > 0) {
    readCurrentScene();
    delay(1);
  }

  if (currentScene >= 0 && currentScene <= 5 || currentScene == 9) {
    pixelsPulse(pixelsButtons, 2);
    pixelsOff(ledRingHand);
  }
  else if (currentScene == 6) {
    pixelsPulse(pixelsHand, 1);
    pixelsOff(ledRingA);
    pixelsOff(ledRingB);
  }
  else if (currentScene > 6 && currentScene < 9) {
    updateInterval = 5;
    pixelsOff(ledRingHand);
    pixelsOff(ledRingA);
    pixelsOff(ledRingB);
  }
  else {
    Serial.println("another scene");
    pixelsOff(ledRingA);
    pixelsOff(ledRingB);
    pixelsOff(ledRingHand);
  }
}

void processButton(int index, int buttonState) {
  // calculate the corresponding key based on the button index:
  char key = 'a' + letterOffsets[index];

  // check if the button is pressed:
  if (buttonState == LOW && lastButtonState[index] == HIGH) {
    // press the corresponding key if it hasn't already been pressed:
    if (!isButtonPressed[index]) {
      // Check if the current scene is valid for calling pixelsBlink
      if (currentScene <= 5 || currentScene == 9) {
        // call pixelsBlink with the correct buttonPIN based on the button index
        if (index == 0) {
          pixelsOff(ledRingB);
          pixelsBlink(ledRingA);
        } else if (index == 1) {
          pixelsOff(ledRingA);
          pixelsBlink(ledRingB);
        }
        brightness = 1;
        fadeDirection = false;
      }
      Keyboard.printf("%c", key);
      isButtonPressed[index] = true;
      delay(50); // add a 50ms delay to debounce the button
    }
  }
  // check if the button is released:
  else if (buttonState == HIGH && lastButtonState[index] == LOW) {
    // release the corresponding key if it's currently pressed:
    if (isButtonPressed[index]) {
      // release the key by sending a null character
      Keyboard.printf("%c", (uint8_t) 0);
      isButtonPressed[index] = false;
      delay(50); // add a 50ms delay to debounce the button
    }
  }
  // save the current state of the button:
  lastButtonState[index] = buttonState;
}

void readCurrentScene() {
    currentScene = Serial.read();
    Serial.println("Received currentScene: " + String(currentScene));
}

void pixelsPulse(Adafruit_NeoPixel** pixelsArray, int numPixels) {
  // Only update every 20 milliseconds (50 updates per second)
  if (currentTime - lastUpdateTime < updateInterval) {
    return;
  }
  lastUpdateTime = currentTime;

  if (fadeDirection) {  // Fade to black
    brightness -= fadeAmount;
  } else {  // Fade to white
    brightness += fadeAmount;
  }
  if (brightness <= brightnessMin || brightness >= brightnessMax) {  // Flip direction if it reaches minimum or maximum
    fadeDirection = !fadeDirection;
  }

  for (int i = 0; i < numPixels; i++) {
    pixelsArray[i]->setBrightness(brightness);
    pixelsArray[i]->show();
  }

}

void pixelsOff(Adafruit_NeoPixel& pixels) {
  //fadeDirection = false;
  pixels.setBrightness(1);
  pixels.show();
}

void pixelsBlink(Adafruit_NeoPixel& pixels) {
  for (int i = 0; i < 2; i++) {
    pixels.setBrightness(1);
    pixels.show();
    delay(100);

    pixels.setBrightness(255);
    pixels.show();
    delay(100);
  }
  pixels.setBrightness(1);
  pixels.show();
}