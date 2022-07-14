import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  isUserNotFound: boolean = false;
  constructor(
    private router: Router,
    private genericService: GenericService,
    private usersService: UserManagementService
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
    }
  }

  async whichUser() {
    let connecteduser = await this.genericService.getConnectedUser();

    let userRole = await this.usersService.getUserRole(connecteduser);
    // If userRole is 0 --> User is not found, userRole 1 is owner, 2 is requester, 3 is superadmin
    if (userRole === 1) {
      this.router.navigate(['data-owner']);
    } else if (userRole === 2) {
      this.router.navigate(['data-requester']);
    } else if (userRole === 3) {
      this.router.navigate(['admin']);
    } else {
      this.router.navigate(['user']);
    }
  }
}
