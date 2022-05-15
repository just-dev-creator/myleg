import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {Observable} from "rxjs";
import {NgForm} from "@angular/forms";
import {getMessaging, getToken} from "firebase/messaging";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  pushNotificationsEnabled: boolean = false;
  constructor(private auth: AuthService, public snackbar: MatSnackBar) { }

  ngOnInit(): void {
    this.getUser();

    // Check if push access was granted already
    const messaging = getMessaging();
    getToken(messaging, {
      vapidKey: 'BM4073qyB7TMXnnDx8BxeYN_g-bobcLGZLnha1SaJ2tIsf2dy2cTG4l0hDGA40ahUBSG-54AOYDr4rn5HKqCUaA'
    }).then((currentToken) => {
      if (currentToken) {
        this.pushNotificationsEnabled = true;
        this.auth.storeMessagingToken(currentToken);
      } else {
        this.pushNotificationsEnabled = false;
      }
    });
  }

  group: string = '';
  email: string = '';

  async getUser() {
    const user = this.auth.getUser();
    if (user instanceof Observable) {
      user.subscribe((value) => {
        if (value.status === 'success') {
          this.group = value.user.group;
          this.email = value.user.email;
        }
      })
    } else {
      this.group = user;
    }
  }

  async onSubmit(f: NgForm) {
    this.auth.putChanges({
      email: f.value.email,
      password: f.value.password,
      group: f.value.group
    });
  }
}
