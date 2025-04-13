import { Component, HostListener , OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './comps/login/login.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent implements OnInit{
  title = 'ZeeSharing';


  promptEvent: any = null;
  status = false

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.promptEvent = event;
      this.status = true;
    });
    console.log("betölt: " + this.status);
  }
  

  public installPwa() {
    this.status = false;
    this.promptEvent.prompt();
    this.promptEvent.userChoice.then((choiceResult: { outcome: string; }) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User mengizinkan install pwa');
        } else {
            console.log('User menolak install pwa');
        }
        this.promptEvent = null;
    });
  }
}
