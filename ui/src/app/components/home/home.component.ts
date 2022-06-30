import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectService } from '../../services/connect.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isUserNotFound: boolean = false;
  constructor(private connectService: ConnectService, private router: Router) {}

  ngOnInit(): void {
    this.isUserConnected();
  }

  async isUserConnected() {
    const isUser = await this.connectService.isUserConnected();
    if (!isUser) {
      this.isUserNotFound = true;
      this.router.navigate(['connect']);
    } else {
      this.whichUser();
      //this.router.navigate(['user']);
    }
  }

  async whichUser() {
    let connecteduser = await this.connectService.getConnectedUser();

    let allusers = await this.connectService.getAllUsers();
    let isExistingUser = allusers.find(
      (user: any) => user.address.toLowerCase() === connecteduser
    );
    if (isExistingUser) {
      this.router.navigate(['admin']);
    }
  }
}
