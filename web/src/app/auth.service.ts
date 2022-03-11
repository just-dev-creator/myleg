import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private cookies: CookieService, private snackbar: MatSnackBar) {
  }


  async createAccountMail(email: string, password: string) {
    this.http.put('/api/user', {
      email: email,
      password: password
    }).subscribe(
      () => {

      }, (error) => {
        console.log(error);
        this.snackbar.open('Registrierung konnte nicht durchgeführt werden', 'Erneut versuchen');
      }, () => {
        this.snackbar.open('Registrierung erfolgreich durchgeführt. Prüfen Sie Ihre Emails. ', 'Einloggen', {
          duration: 3000
        })
      }
    )
  }

  async loginMail(email: string, password: string) {
    this.http.post<any>('/api/user', {
      email: email,
      password: password,
    }).subscribe(
      (response) => {
        if (response.status !== 'success') {
          alert('Error: ' + response.status);
        } else {
          this.cookies.set('login', response.token, {
            expires: 3
          })
        }
      },
      () => {
        this.snackbar.open('Benutzername oder Passwort falsch', 'Erneut versuchen')
      }
    );
  }

  getGroup(): Observable<any> | undefined {
    if (!this.cookies.get('login')) {
      return;
    }
    return this.http.get<any>('/api/groups?token=' + this.cookies.get('login'));
  }

  getUser(): any {
    if (!this.cookies.get('login')) {
      return null;
    }
    return this.http.get<any>('/api/user?token=' + this.cookies.get('login'));
  }

  putChanges(user: IUser) {
    if (!this.cookies.get('login')) {
      return;
    }
    this.http.patch<any>('/api/user', {
      token: this.cookies.get('login'),
      user: user
    }).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.snackbar.open("Daten erfolgreich geändert!", "OK")
        }
      },
      () => {

      },
      () => {

      }
    );
  }
  public isAuthenticated(): boolean {
    const token = this.cookies.get('login');

    return !new JwtHelperService().isTokenExpired(token);
  }

  public getToken(): string {
    return this.cookies.get('login');
  }

  storeMessagingToken(token: string | false) {
    return this.http.post<any>('/api/messaging', {
      token: this.cookies.get('login'),
      messaging: token
    });
  }

  getABIT(group: string): Observable<any> | undefined {
    if (!this.cookies.get('login')) {
      return;
    }
    return this.http.get<any>('/api/covid?group=' + group, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.cookies.get('login')}`
      })
    });
  }
}

export interface IUser {
  email: string,
  password: string,
  group: string | null,
}
