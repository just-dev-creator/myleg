import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-covid',
  templateUrl: './covid.component.html',
  styleUrls: ['./covid.component.css']
})
export class CovidComponent implements OnInit {

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.auth.getGroup()?.subscribe(
      (response) => {
        if (response.status === 'success') {
          this.group = response.group.match(/[0-9]{1,2}/)[0];
          this.getGroup(this.group);
        }
      }
    )
  }

  group: string = '';
  loading: boolean = false;
  isABIT: boolean | undefined = true;

  async onSubmit(f: NgForm) {
    this.getGroup(f.value.group);
  }

  async getGroup(group: string) {
    this.loading = true;
    this.isABIT = undefined;
    this.auth.getABIT(group)?.subscribe(
      (response) => {
        if (response.status === 'success') {
          this.isABIT = response.data;
          this.loading = false;
        }
      }
    )
  }

}
