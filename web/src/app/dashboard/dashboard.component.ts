import { Component, OnInit } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Substitution} from "../get-group/substitution";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private http: HttpClient, private auth: AuthService) { }

  substitutions: Substitution[] = [];
  isAbit: boolean | undefined;

  ngOnInit(): void {
    this.getSubstitutions();
    this.getCovid();
  }

  getSubstitutions() {
    this.http.get<any>("/api/getgroup/?date=all&group=" + this.auth.getGroupToken(), {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.auth.getToken()
      })
    }).subscribe((res) => {
      if (res.status === 'success') {
        this.substitutions = res.substitutions;
      }
    });
  }

  private getCovid() {
    this.auth.getABIT(this.auth.getGroupToken()!)?.subscribe(
      (response) => {
        if (response.status === 'success') {
          this.isAbit = response.data;
        }
      }
    )
  }
}
