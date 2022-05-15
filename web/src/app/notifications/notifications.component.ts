import { Component, OnInit } from '@angular/core';
import {getMessaging, getToken} from "firebase/messaging";
import {AuthService} from "../auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  pushNotificationsEnabled: boolean = false;
  notificationState: any = {}
  constructor(private auth: AuthService, public snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
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
    this.auth.getNotifications()?.subscribe(
      (res: any) => {
        this.notificationState = res;
      }
    )
  }

  async togglePush() {
    if (this.pushNotificationsEnabled) {
      this.auth.storeMessagingToken(false).subscribe((response) => {
        if (response.status === 'success') {
          this.snackbar.open('Push-Nachrichten sind nun inaktiv', undefined, {
            duration: 3000
          });
          this.pushNotificationsEnabled = false;
        }
      });
    } else {
      const messaging = getMessaging();
      getToken(messaging, {
        vapidKey: 'BM4073qyB7TMXnnDx8BxeYN_g-bobcLGZLnha1SaJ2tIsf2dy2cTG4l0hDGA40ahUBSG-54AOYDr4rn5HKqCUaA'
      }).then((currentToken) => {
        if (currentToken) {
          this.pushNotificationsEnabled = true;
          this.auth.storeMessagingToken(currentToken).subscribe((response) => {
            if (response.status === 'success') {
              this.snackbar.open('Push-Nachrichten sind nun aktiv', undefined, {
                duration: 3000
              })
            }
          })
        } else {
          this.pushNotificationsEnabled = false;
        }
      });
    }
  }

  async setNotification(notification: string, value: boolean) {
    console.log(notification, value);
    this.notificationState[notification] = value;
    this.auth.setNotifications(this.notificationState);
  }
}
