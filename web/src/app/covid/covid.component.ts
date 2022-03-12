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
    const groupToken = this.auth.getGroupToken();
    if (groupToken) {
     const group = groupToken.match(/[0-9]{1,2}/);
     if (group?.length === 1) {
       this.group = group[0];
       this.getGroup(this.group);
     }
    }
  }

  group: string = '';
  loading: boolean = false;
  isABIT: boolean | undefined;

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
