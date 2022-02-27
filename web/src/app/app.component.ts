import { Component } from '@angular/core';
import { getMessaging, onMessage } from "firebase/messaging";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web';
  constructor(public router: Router, public cookies: CookieService, public snackbar: MatSnackBar) {
  }
  ngOnInit(): void {
    this.listen();
  }

  listen() {
    const messaging = getMessaging();
    onMessage(messaging, () => {
      this.snackbar.open('Es sind neue Vertretungen für dich verfügbar', 'Weitere Informationen', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/']);
      })
    })
  }
}
