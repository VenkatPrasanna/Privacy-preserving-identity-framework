import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { GenericService } from '../../services/generic.service';
import { ConnectService } from '../../services/connect.service';
import { AlertsService } from '../../services/alerts.service';

export interface UserType {
  id: Number;
  name: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit {
  users: UserType[] = [
    { id: 1, name: 'Owner' },
    { id: 2, name: 'Requester' },
  ];

  ownerRegistrationForm: any;
  requesterRegistrationForm: any;
  selectedUserType: any;
  isLoading: boolean = false;

  constructor(
    private genericService: GenericService,
    private connectService: ConnectService,
    private alertService: AlertsService
  ) {}

  ngOnInit(): void {
    //this.connectService.isUserConnected();
    this.ownerRegistrationForm = new FormGroup({
      profession: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });

    this.requesterRegistrationForm = new FormGroup({
      organisation: new FormControl('', Validators.required),
      department: new FormControl('', Validators.required),
      role: new FormControl('', Validators.required),
    });
  }

  async registerOwner() {
    try {
      this.isLoading = true;
      let { profession, location } = this.ownerRegistrationForm.value;
      if (!profession || !location) return;
      profession = this.genericService.stringToBytes(profession);
      location = this.genericService.stringToBytes(location);
      let connecteduser = await this.genericService.getConnectedUser();
      let txnConfirmation = await this.connectService.addOwner(
        connecteduser,
        profession,
        location
      );
      if (txnConfirmation.confirmations === 1) {
        this.isLoading = false;
        this.alertService.alertSuccessMessage('Request submitted successfully');
      }
    } catch (error: any) {
      this.isLoading = false;
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async registerRequester() {
    try {
      this.isLoading = true;
      let { organisation, department, role } =
        this.requesterRegistrationForm.value;
      if (!organisation || !department || !role) return;
      organisation = this.genericService.stringToBytes(
        organisation.toLowerCase()
      );
      department = this.genericService.stringToBytes(department.toLowerCase());
      role = this.genericService.stringToBytes(role.toLowerCase());
      let connecteduser = await this.genericService.getConnectedUser();
      let txnConfirmation = await this.connectService.addRequester(
        connecteduser,
        organisation,
        department,
        role
      );
      if (txnConfirmation.confirmations === 1) {
        this.isLoading = false;
        this.alertService.alertSuccessMessage('Request submitted successfully');
      }
    } catch (error: any) {
      console.log(error);
      this.isLoading = false;
      this.alertService.alertErrorMessage(error.message);
    }
  }

  resetForms() {
    this.isLoading = false;
    this.ownerRegistrationForm.reset();
    this.requesterRegistrationForm.reset();
  }
}
