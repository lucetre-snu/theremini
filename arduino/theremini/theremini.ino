#include <FirebaseESP32.h>
#include <NewPing.h>
#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
#include <WiFi.h>
#include <IRremote.h>

#define TRIGGER_PIN   25
#define ECHO_PIN      26
#define MAX_DISTANCE  40
#define RECEIVER_PIN  35
#define POTENTIO_PIN  34

#define WIFI_SSID     "lucetre"
#define WIFI_PASS     "1207035235"
#define INST_STR      "accordion acoustic_bass acoustic_grand_piano acoustic_guitar_nylon acoustic_guitar_steel agogo alto_sax applause bagpipe banjo baritone_sax bassoon bird_tweet blown_bottle brass_section breath_noise bright_acoustic_piano celesta cello choir_aahs church_organ clarinet clavinet contrabass distortion_guitar drawbar_organ dulcimer electric_bass_finger electric_bass_pick electric_grand_piano electric_guitar_clean electric_guitar_jazz electric_guitar_muted electric_piano_1 electric_piano_2 english_horn fiddle flute french_horn fretless_bass fx_1_rain fx_2_soundtrack fx_3_crystal fx_4_atmosphere fx_5_brightness fx_6_goblins fx_7_echoes fx_8_scifi glockenspiel guitar_fret_noise guitar_harmonics gunshot harmonica harpsichord helicopter honkytonk_piano kalimba koto lead_1_square lead_2_sawtooth lead_3_calliope lead_4_chiff lead_5_charang lead_6_voice lead_7_fifths lead_8_bass__lead marimba melodic_tom music_box muted_trumpet oboe ocarina orchestra_hit orchestral_harp overdriven_guitar pad_1_new_age pad_2_warm pad_3_polysynth pad_4_choir pad_5_bowed pad_6_metallic pad_7_halo pad_8_sweep pan_flute percussive_organ piccolo pizzicato_strings recorder reed_organ reverse_cymbal rock_organ seashore shakuhachi shamisen shanai sitar slap_bass_1 slap_bass_2 soprano_sax steel_drums string_ensemble_1 string_ensemble_2 synth_bass_1 synth_bass_2 synth_brass_1 synth_brass_2 synth_choir synth_drum synth_strings_1 synth_strings_2 taiko_drum tango_accordion telephone_ring tenor_sax timpani tinkle_bell tremolo_strings trombone trumpet tuba tubular_bells vibraphone viola violin voice_oohs whistle woodblock xylophone"
#define NOTE_STR      "C Db D Eb E F Gb G Ab A Bb B"
#define FIREBASE_HOST "theremini-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "LTyHR3ei8A3d8Hc56djoEgvOAxrOwROSEx8czqAf"
#define WHITE_SPACE   "         "

NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE);
LiquidCrystal_I2C lcd(0x27, 16, 2);
IRrecv receiver(RECEIVER_PIN);
FirebaseData firebaseData;

String instList[200];
String noteList[100];
String curNote = "";
String curInst = "accordion";
int instSize, noteSize;
int curInstIdx;

void fetchList() {
  String instStr = INST_STR;
  while (instStr.length() > 0) {
    int index = instStr.indexOf(' ');
    if (index == -1) {
      instList[instSize++] = instStr;
      break;
    }
    else {
      instList[instSize++] = instStr.substring(0, index);
      instStr = instStr.substring(index + 1);
    }
  }
  String noteStr = NOTE_STR;
  while (noteStr.length() > 0) {
    int index = noteStr.indexOf(' ');
    if (index == -1) {
      noteList[noteSize++] = noteStr;
      break;
    }
    else {
      noteList[noteSize++] = noteStr.substring(0, index);
      noteStr = noteStr.substring(index + 1);
    }
  }
  int sOct = 3, eOct = 4;
  for (int i = eOct; i >= sOct; i--) {
    for (int j = 0; j < noteSize; j++) {
      noteList[(i - sOct) * noteSize + j] = noteList[j] + String(i);
    }
  }
  noteSize *= (eOct - sOct + 1);
}

int prevNoteIdx = -1;
String getNote(int pitch) {
  if (pitch == 0) {
    prevNoteIdx = -1;
    return "";
  }
  int curNoteIdx = pitch * noteSize / 2000;
  if (curNoteIdx == prevNoteIdx) {
    return noteList[curNoteIdx];
  }
  prevNoteIdx = curNoteIdx;
  return "";
}

void setup() {
  fetchList();
  Serial.begin(115200);
  pinMode(POTENTIO_PIN, INPUT);

  lcd.init();
  lcd.init();
  lcd.backlight();
  receiver.enableIRIn();

  delay(10);
  Serial.println();
  Serial.print("Connecting");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("WiFi connected IP: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
}

void loop() {
  if (receiver.decode()) {
    int cmd = receiver.decodedIRData.command;
    receiver.resume();
    if (cmd == 0x15) curInstIdx++;
    if (cmd == 0x07) curInstIdx--;
    curInstIdx = (curInstIdx + instSize) % instSize;
    curInst = instList[curInstIdx];
  }

  int pitch = sonar.ping();
  String inst = curInst;
  String note = getNote(pitch);
  String volume = String(analogRead(POTENTIO_PIN) / 4096.0);

  lcd.setCursor(0, 0);
  lcd.print(inst + WHITE_SPACE);
  lcd.setCursor(0, 1);
  lcd.print(note + WHITE_SPACE);
  lcd.setCursor(12, 1);
  lcd.print(volume);

  if (note != "" && curNote != note) {
    FirebaseJson json;
    json.set("inst", inst);
    json.set("note", note);
    json.set("volume", volume);
    Firebase.set(firebaseData, "/theremini", json);
    Serial.println(inst + "-" + note + "-" + volume);
    curNote = note;
  }
  delay(30);
}
