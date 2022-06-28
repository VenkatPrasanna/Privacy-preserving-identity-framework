import { Component } from '@angular/core';
import { ConnectService } from './services/connect.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'App';
  currentUser: any;
  isUnregisteredUser: boolean = false;
  users = [
    { address: '0x5a33dd3da9d28905eddb3956291087baee30f711', role: 'owner' },
    {
      address: '0x97c72ee252116c53168be2734f0e92ef5e86c80f',
      role: 'requester',
    },
  ];
  constructor(private cs: ConnectService) {
    //this.connectWallet();
  }
  async connectWallet() {
    this.currentUser = await this.cs.connectWallet();
    let is = this.users.find((user) => user.address === this.currentUser);
    if (!is) {
      this.isUnregisteredUser = true;
    }
  }
  async disconnect() {
    this.cs.disconnect();
  }
}
