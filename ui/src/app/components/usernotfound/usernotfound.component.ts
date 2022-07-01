import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic.service';
@Component({
  selector: 'app-usernotfound',
  templateUrl: './usernotfound.component.html',
  styleUrls: ['./usernotfound.component.css'],
})
export class UsernotfoundComponent implements OnInit {
  constructor(public genericService: GenericService) {}

  ngOnInit(): void {}

  async onConnect() {
    this.genericService.connectWallet();
  }
}
