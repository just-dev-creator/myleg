import { Component, OnInit} from '@angular/core';
import {NgForm} from "@angular/forms";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Substitution} from "./substitution";
import {Observable} from "rxjs";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-get-group',
  templateUrl: './get-group.component.html',
  styleUrls: ['./get-group.component.css']
})
export class GetGroupComponent implements OnInit {
  loading: boolean = false;
  constructor(private http: HttpClient, private auth: AuthService) { }
  group: string = '';

  ngOnInit(): void {
    this.getDefaultGroup();
  }

  results: Substitution[] = [];

  async onSubmit(f: NgForm) {
    let response: Observable<Substitution[]> | undefined | null;
    this.loading = true;
    this.results = [];
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.auth.getToken()}`
    });
    if (f.value.date === 'next') {
      const date = getNextWeekday();
      response = this.http.get<Substitution[]>(`/api/getgroup/?date=${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}&group=${f.value.group}
      `, {
        headers: headers
      });
    } else {
      response = this.http.get<Substitution[]>(`/api/getgroup/?group=${f.value.group}`, {
        headers: headers
      });
    }
    response.subscribe(
      (res) => {
        this.results = res;
      },
      () => {},
      () => {
        this.loading = false;
      }
    )
  }

  async getDefaultGroup() {
    const group = this.auth.getGroup();
    if (group instanceof Observable) {
      group.subscribe((value) => {
        if (value.status === 'success') {
          this.group = value.group;
        }
      })
    } else {
      this.group = group;
    }
  }

}

function getNextWeekday(): Date {
  let next_weekday: Date = new Date();
  if (next_weekday.getDay() === 6) {
    next_weekday.setDate(next_weekday.getDate() + 2)
  } else {
    next_weekday.setDate(next_weekday.getDate() + 1)
  }
  next_weekday.setHours(0, 0, 0, 0);
  next_weekday.setTime(next_weekday.getTime() - 60 * 1000 * next_weekday.getTimezoneOffset());
  return next_weekday;
}
