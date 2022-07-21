import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GenericService } from '../../../services/generic.service';
import { ServerService } from '../../../services/server.service';
import { AlertsService } from 'src/app/services/alerts.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { ModifyDataComponent } from './modify-data/modify-data.component';
import { PolicyComponent } from './policy/policy.component';
import { DataManagementService } from 'src/app/services/data-management.service';

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
  isLoading: boolean = false;
  ownerRegistrationForm: any;
  displayForm: boolean = false;
  showCancelBtn: boolean = false;
  isProfile: boolean = true;
  isRequests: boolean = false;
  isDataSets: boolean = false;
  displayedColumns: string[] = ['id', 'name', 'value', 'category', 'actions'];
  dataSource: any;

  keyRequestsSource: any;
  keyRequestsColumns: string[] = ['id', 'requester', 'matchtype', 'actions'];
  @ViewChild(MatTable) table: MatTable<Dataset>;

  constructor(
    private dataService: DataManagementService,
    private genericService: GenericService,
    private serverService: ServerService,
    private usersService: UserManagementService,
    private alertService: AlertsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.ownerRegistrationForm = new FormGroup({
      profession: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });
    this.getOwnerDetails();
    //this.getAllkeys();
  }

  applyFilter(event: Event, type: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (type === 'key') {
      this.keyRequestsSource.filter = filterValue.trim().toLowerCase();
    } else {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  async modifyData(actiontype: string, toUpdateDataset: any) {
    let categories: string[] = await this.usersService.getAllCategories();
    let dialogRef: any;
    if (actiontype === 'add') {
      dialogRef = this.dialog.open(ModifyDataComponent, {
        height: '400px',
        width: '600px',
        data: {
          type: 'Add',
          categories: categories,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        let datasets = this.dataSource.data;
        datasets.push(result);
        this.dataSource.data = datasets;
        this.table.renderRows();
      });
    } else if (actiontype === 'update') {
      dialogRef = this.dialog.open(ModifyDataComponent, {
        data: {
          type: 'Update',
          dataset: toUpdateDataset,
          categories: categories,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          let datasets = this.dataSource.data;
          let index = datasets.findIndex(
            (data: any) => data.dataid === result.dataid
          );
          datasets[index].name = result.name;
          datasets[index].value = result.value;
          datasets[index].category = result.category;
          this.dataSource.data = datasets;
          this.table.renderRows();
        }
      });
    }
  }

  updatePolicy(dataid: string) {
    let dialogRef = this.dialog.open(PolicyComponent, {
      height: '500px',
      width: '600px',
      data: {
        dataid: dataid,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('policy updated');
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
      this.getKeyRequests();
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
  }

  onCancelButtonClick() {
    this.displayForm = false;
    this.showCancelBtn = false;
  }

  async getOwnerDetails() {
    let owner: any = await this.usersService.getDataOwnerDetails();
    this.dataOwner = owner;
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      let { profession, location } = this.ownerRegistrationForm.value;
      if (!profession || !location) {
        return;
      }
      profession = this.genericService.stringToBytes(profession);
      location = this.genericService.stringToBytes(location);
      let connecteduser = await this.genericService.getConnectedUser();
      let txnConfirmation = await this.usersService.updateDataOwner(
        connecteduser,
        profession,
        location
      );
      if (txnConfirmation && txnConfirmation.confirmations === 1) {
        this.isLoading = false;
        this.resetForms();
        this.displayForm = false;
        this.getOwnerDetails();
        this.alertService.alertSuccessMessage('Request submitted successfully');
      }
    } catch (error: any) {
      console.log(error);
      this.isLoading = false;
      this.alertService.alertSuccessMessage(error.data.message);
    }
  }

  async getDatasets() {
    let datasets = await this.dataService.getUserData();
    this.dataSource = new MatTableDataSource(datasets);
  }

  async getKeyRequests() {
    try {
      let keyrequests = await this.dataService.filteredKeyRequests();
      this.keyRequestsSource = new MatTableDataSource(keyrequests);
    } catch (error) {
      console.log(error);
    }
  }

  async approveRequest(element: any) {
    try {
      let txn: any = await this.dataService.approveRequest(
        element.dataid,
        element.requesterAddress
      );
      this.keyRequestsSource = this.keyRequestsSource.data.filter(
        (item: any) => item.dataid !== element.dataid
      );
    } catch (error) {
      console.log(error);
    }
  }

  shortendVal(value: string) {
    let shortendValue = `${value.slice(0, 7)}....`;
    return shortendValue;
  }

  // async getAllkeys() {
  //   let keys = await this.serverService.getAllKeys();
  //   keys.subscribe((data: any) => {
  //     console.log(data);
  //   });
  //   let key = await this.serverService.getKeybyId(
  //     'e08ac05f0df146f3a6d5da00d1bb7b9e'
  //   );
  //   key.subscribe((data: any) => {
  //     console.log(data);
  //   });
  // }

  resetForms() {
    this.ownerRegistrationForm.reset();
  }
}
