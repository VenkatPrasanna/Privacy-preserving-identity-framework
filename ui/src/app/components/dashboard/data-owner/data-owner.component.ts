import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConnectService } from '../../../services/connect.service';
import { GenericService } from '../../../services/generic.service';
import { ServerService } from '../../../services/server.service';
import { ModifyDataComponent } from './modify-data/modify-data.component';
import { PolicyComponent } from './policy/policy.component';

export interface DialogData {
  animal: 'panda' | 'unicorn' | 'lion';
}

export interface DataOwner {
  ownerAddress: string;
  profession: string;
  location: string;
  approved: boolean;
}

export interface Dataset {
  dataid: string;
  address: string;
  name: string;
  value: string;
  category: string;
}

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

  displayedColumns: string[] = ['id', 'name', 'value', 'category', 'actions'];
  dataSource: any;
  @ViewChild(MatTable) table: MatTable<Dataset>;

  constructor(
    private connectService: ConnectService,
    private genericService: GenericService,
    private serverService: ServerService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ownerRegistrationForm = new FormGroup({
      profession: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });
    this.getOwnerDetails();
    this.getAllkeys();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  modifyData(actiontype: string) {
    let categories = ['Marketing', 'Automobile'];
    let dialogRef: any;
    if (actiontype === 'add') {
      dialogRef = this.dialog.open(ModifyDataComponent, {
        height: '400px',
        width: '600px',
        data: {
          type: 'add',
          categories: categories,
        },
        disableClose: true,
      });
    } else if (actiontype === 'update') {
      dialogRef = this.dialog.open(ModifyDataComponent, {
        data: {
          type: 'update',
          categories: categories,
        },
      });
    }
    dialogRef.afterClosed().subscribe((result: any) => {
      let datasets = this.dataSource.data;
      datasets.push(result);
      this.dataSource.data = datasets;
      this.table.renderRows();
    });
  }

  updatePolicy(dataid: string) {
    console.log('update policy', dataid);
    let dialogRef = this.dialog.open(PolicyComponent, {
      height: '500px',
      width: '600px',
      data: {
        dataid: dataid,
      },
      disableClose: true,
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
      if (!this.dataSource) {
        this.getDatasets();
      }
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
      profession = this.genericService.stringToBytes(profession);
      location = this.genericService.stringToBytes(location);
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
      profession = this.genericService.stringToBytes(profession);
      location = this.genericService.stringToBytes(location);
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

  async getDatasets() {
    let datasets = await this.connectService.getUserData();
    this.dataSource = new MatTableDataSource(datasets);
  }

  async getAllkeys() {
    console.log('all keys');
    let keys = await this.serverService.getAllKeys();
    keys.subscribe((data: any) => {
      console.log(data);
    });
  }

  resetForms() {
    this.ownerRegistrationForm.reset();
  }
}
