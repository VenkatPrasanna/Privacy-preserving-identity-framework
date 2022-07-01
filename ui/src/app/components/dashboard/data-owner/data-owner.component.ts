import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConnectService } from '../../../services/connect.service';
import { GenericService } from '../../../services/generic.service';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

export interface DataOwner {
  ownerAddress: string;
  profession: string;
  location: string;
  approved: boolean;
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
];

const categories = ['Market', 'Health', 'Identity governance'];

@Component({
  selector: 'app-data-owner',
  templateUrl: './data-owner.component.html',
  styleUrls: ['./data-owner.component.css'],
})
export class DataOwnerComponent implements OnInit {
  dataOwner: DataOwner = {
    ownerAddress: '',
    profession: '',
    location: '',
    approved: false,
  };
  ownerRegistrationForm: any;
  displayForm: boolean = false;
  showCancelBtn: boolean = false;
  isUserAddition: boolean = false;
  isProfile: boolean = true;
  isRequests: boolean = false;
  isDataSets: boolean = false;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  constructor(
    private connectService: ConnectService,
    private genericService: GenericService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ownerRegistrationForm = new FormGroup({
      profession: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });
    this.getOwnerDetails();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog() {
    this.dialog.open(DialogDataExampleDialog, {
      data: {
        animal: 'panda',
      },
    });
  }

  // Toggle relevant sections based on user actions
  updateView(section: string) {
    if (section === 'profile') {
      this.isProfile = true;
      this.isDataSets = false;
      this.isRequests = false;
    } else if (section === 'requests') {
      this.isProfile = false;
      this.isDataSets = false;
      this.isRequests = true;
    } else if (section === 'dataset') {
      this.isProfile = false;
      this.isRequests = false;
      this.isDataSets = true;
    }
  }

  onUpdateButtonClick() {
    this.displayForm = true;
    this.showCancelBtn = true;
    this.isUserAddition = false;
  }

  onCancelButtonClick() {
    this.displayForm = false;
    this.showCancelBtn = false;
    this.isUserAddition = true;
  }

  async getOwnerDetails() {
    let owner: any = await this.connectService.getDataOwnerDetails();
    this.dataOwner = owner;
    this.dataOwner.approved = true;
    if (owner.approved) {
      console.log('Approved owner');
    } else {
      console.log('Not approved owner');
      if (!owner.profession || !owner.location) {
        this.displayForm = true;
        this.isUserAddition = true;
      } else {
        this.displayForm = false;
        this.isUserAddition = false;
      }
    }
  }

  async registerOwner() {
    try {
      let { profession, location } = this.ownerRegistrationForm.value;
      profession = this.genericService.stringToBytes32(profession);
      location = this.genericService.stringToBytes32(location);
      let connecteduser = await this.genericService.getConnectedUser();
      console.log(connecteduser, profession, location);
      console.log(this.isUserAddition);
      // let txn = await this.connectService.addOwner(
      //   connecteduser,
      //   profession,
      //   location
      // );
      // console.log(txn);
    } catch (error) {
      console.log(error);
    }
  }

  async updateOwner() {
    try {
      let { profession, location } = this.ownerRegistrationForm.value;
      profession = this.genericService.stringToBytes32(profession);
      location = this.genericService.stringToBytes32(location);
      let connecteduser = await this.genericService.getConnectedUser();
      console.log(connecteduser, profession, location);
      console.log(this.isUserAddition);
      // let txn = await this.connectService.updateOwner(
      //   connecteduser,
      //   profession,
      //   location
      // );
      // console.log(txn);
    } catch (error) {
      console.log(error);
    }
  }

  async onSubmit() {
    try {
      // check which mode to submit
      if (this.isUserAddition) {
        this.registerOwner();
      } else {
        this.updateOwner();
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  resetForms() {
    this.ownerRegistrationForm.reset();
  }
}

@Component({
  selector: 'modify-data',
  templateUrl: 'modify-data.component.html',
})
export class DialogDataExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
