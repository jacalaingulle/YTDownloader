import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');

  url = signal('');
  format = signal('mp3');
  downloading = signal(false);
  btntext = signal('Download');

  constructor(private http: HttpClient) {}

  download() {
    const body = {
      url: this.url(),
      format: this.format()
    };

    this.downloading.set(true);
    this.btntext.set('Downloading');

    this.http.post('http://localhost:3000/download', body, {
      responseType: 'blob'
    }).subscribe(blob => {

      const a = document.createElement('a');
      this.url.set(window.URL.createObjectURL(blob)); 

      a.href = this.url();
      a.download = this.format() === 'mp3' ? 'audio.mp3' : 'video.mp4';
      a.click();

      window.URL.revokeObjectURL(this.url());

      setTimeout(() => {
        this.downloading.set(false);
        this.btntext.set('Download');
        this.url.set('');
      }, 2000);
    });
  }
}
