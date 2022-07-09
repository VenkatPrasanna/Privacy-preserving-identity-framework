import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ConnectService } from '../../services/connect.service';
import { GenericService } from '../../services/generic.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isUserNotFound: boolean = false;
  constructor(
    private connectService: ConnectService,
    private router: Router,
    private genericService: GenericService
  ) {}

  ngOnInit(): void {
    this.isUserConnected();
  }

  async isUserConnected() {
    const isUser = await this.genericService.isUserConnected();
    if (!isUser) {
      this.isUserNotFound = true;
      this.router.navigate(['connect']);
    } else {
      this.whichUser();
      //this.router.navigate(['user']);
    }
  }

  async whichUser() {
    let connecteduser = await this.genericService.getConnectedUser();

    let allusers = await this.connectService.getAllUsers();
    let isExistingUser = allusers.find(
      (user: any) => user.address.toLowerCase() === connecteduser
    );
    console.log(isExistingUser);
    if (isExistingUser) {
      // Check here for approval status
      // Roles - 1 is Data owner, 2 is Data Requester
      if (isExistingUser.role === 1) {
        this.router.navigate(['data-owner']);
      } else if (isExistingUser.role === 2) {
        this.router.navigate(['data-requester']);
      }
      //this.router.navigate(['admin']);
    } else {
      this.router.navigate(['user']);
    }
  }
}
