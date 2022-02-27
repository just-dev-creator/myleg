import {Component, Input, OnInit} from '@angular/core';
import {Substitution} from "../get-group/substitution";

@Component({
  selector: 'app-substitution',
  templateUrl: './substitution.component.html',
  styleUrls: ['./substitution.component.css']
})
export class SubstitutionComponent implements OnInit {
  @Input()
  constitution: Substitution | null = null;
  constructor() { }

  ngOnInit(): void {
  }

}
