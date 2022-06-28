import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../../services/connect.service';
@Component({
  selector: 'app-usernotfound',
  templateUrl: './usernotfound.component.html',
  styleUrls: ['./usernotfound.component.css'],
})
export class UsernotfoundComponent implements OnInit {
  constructor(public connectService: ConnectService) {}

  ngOnInit(): void {}

  async onConnect() {
    this.connectService.connectWallet();
  }
}
