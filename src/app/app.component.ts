import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { origin } from '../constants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  files: {name: string}[] = []
  submitting: boolean = false;

  formChange(event: any) {
    this.files = event.target.files;
    // console.log(this.files);
  }

  uploadFiles(ev: Event): void {
    ev.preventDefault();

    if (!this.files) {
      alert("No files selected!");
      return;
    }

    this.submitting = true;
    let k = this;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", `${origin}/Comment`, true);

    xhr.responseType = "blob";
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          let blob = xhr.response;

          /* Get filename from Content-Disposition header */
          let filename = "";
          let disposition = xhr.getResponseHeader('Content-Disposition');
          if (disposition && disposition.indexOf('attachment') !== -1) {
              let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              let matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
          }
          console.log(filename);
          // This does the trick
          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.download = filename;
          a.dispatchEvent(new MouseEvent('click'));
        }
        else {
          alert("Could not send the request, API responded with: " + `${this.status} ${this.statusText}`);
        }
        k.submitting = false;
      }
    };

    xhr.ontimeout = function (e) {
      alert("Service timed-out, try again later or get a better internet connection.")
      k.submitting = false;
    }

    let e = (document.getElementById("main-form")! as HTMLFormElement);
    xhr.send(new FormData(e));
    e.reset();
  }
}
