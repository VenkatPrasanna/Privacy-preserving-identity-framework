import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-modify-data',
  templateUrl: './modify-data.component.html',
  styleUrls: ['./modify-data.component.css'],
})
export class ModifyDataComponent implements OnInit {
  dataForm: any;
  constructor() {}

  ngOnInit(): void {
    this.dataForm = new FormGroup({});
  }
}
