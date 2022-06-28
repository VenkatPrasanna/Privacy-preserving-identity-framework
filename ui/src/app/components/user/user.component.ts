import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ConnectService } from '../../services/connect.service';

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

  constructor(private connectService: ConnectService, public fb: FormBuilder) {}

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

  stringToBytes32(str: string) {
    const buffstr = Buffer.from(str).toString('hex');
    return '0x' + buffstr + '0'.repeat(64 - buffstr.length);
  }

  bytes32ToString(bytes: any) {
    return Buffer.from(bytes.slice(2).split('00')[0], 'hex').toString();
  }

  async registerOwner() {
    try {
      let { profession, location } = this.ownerRegistrationForm.value;
      profession = this.stringToBytes32(profession);
      location = this.stringToBytes32(location);
      let connecteduser = await this.connectService.getConnectedUser();
      console.log(connecteduser, profession, location);
      let txn = await this.connectService.addOwner(
        connecteduser,
        profession,
        location
      );
      console.log(txn);
    } catch (error) {
      console.log(error);
    }
  }

  async registerRequester() {}

  onUserTypeChange() {
    console.log('dshf');
    console.log(this.selectedUserType);
  }

  resetForms() {
    this.ownerRegistrationForm.reset();
    this.requesterRegistrationForm.reset();
  }
}
