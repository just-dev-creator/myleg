import {Component, Input, OnInit} from '@angular/core';
import {Substitution} from "../get-group/substitution";

@Component({
  selector: 'app-substitution',
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.css']
})
export class SubstitutionComponent implements OnInit {
  @Input()
  constitution: Substitution | undefined;
  @Input()
  showDate: string = 'false';

  date: Date = new Date();
  dateStr: string = '';

  constructor() {
  }


  ngOnInit(): void {
    if (this.constitution) {
      this.date = new Date(this.constitution.date);
      this.dateStr = this.date.toLocaleDateString("de-DE", {
        weekday: "short",
        month: "numeric",
        day: "numeric"
      })
    }
  }

}
