import {
  ApplicationRef,
  Component,
  NgZone,
  AfterViewChecked
} from "@angular/core";
import { playNotes, iterate, buffer, getNearestNote } from "./player";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  private audioContext = new AudioContext();
  private oscillator: OscillatorNode;
  private playing = false;

  constructor(private ref: ApplicationRef, private ngZone: NgZone) {
    const originalTick = ref.tick;
    const self = this;
    ref.tick = function() {
      const result = originalTick.apply(this, arguments);
      iterate(this._views);
      self.p();
      return result;
    };
  }

  p() {
    if (this.playing) {
      return;
    }

    this.playing = true;
    const b = buffer
      .map(i => {
        if (i === 0) {
          return Math.round(Math.random() * 7000);
        }
        if (i < 100) {
          return i * 100;
        } else {
          return i;
        }
      })
      .map(i => getNearestNote(i));
    console.log(b);
    this.ngZone.runOutsideAngular(() => {
      playNotes(b).then(() => (this.playing = false));
    });
  }

  play() {
    this.playing = !this.playing;

    if (this.playing) {
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.connect(this.audioContext.destination);
      this.oscillator.frequency.setValueAtTime(
        466.16,
        this.audioContext.currentTime
      );
      this.oscillator.type = "triangle";
      this.oscillator.start();
    } else {
      this.oscillator.stop();
      this.oscillator = null;
    }
  }
}
