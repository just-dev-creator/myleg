import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private readonly auth: AuthService, public cookies: CookieService) { }

  email: string = "";
  password: string = ""
  ngOnInit(): void {
  }

  async login() {
    await this.auth.loginMail(this.email, this.password);
  }

  async register() {
    console.log('reg1')
    await this.auth.createAccountMail(this.email, this.password);
  }

  logout() {
    this.cookies.delete('login');
  }
}
