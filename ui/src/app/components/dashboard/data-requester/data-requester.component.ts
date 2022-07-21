import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DataManagementService } from 'src/app/services/data-management.service';
import { GenericService } from '../../../services/generic.service';
import { AlertsService } from '../../../services/alerts.service';
import { PolicyManagementService } from 'src/app/services/policy-management.service';
import { UserManagementService } from 'src/app/services/user-management.service';

export interface DataRequester {
  requesterAddress: string;
  organisation: string;
  department: string;
  designation: string;
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
  selector: 'app-data-requester',
  templateUrl: './data-requester.component.html',
  styleUrls: ['./data-requester.component.css'],
})
export class DataRequesterComponent implements OnInit {
  dataRequester: DataRequester = {
    requesterAddress: '',
    organisation: '',
    department: '',
    designation: '',
    approved: false,
  };
  isLoading = false;
  isProfile: boolean = true;
  isDataSets: boolean = false;
  isAllowedData: boolean = false;
  isOtherData: boolean = false;
  displayedColumns: string[] = ['dataid', 'name', 'category', 'actions'];
  dataSource: any;
  otherDatasets: any;
  policyMatch: boolean = false;
  displayForm: boolean = false;
  showCancelBtn: boolean = false;
  updateForm: FormGroup;
  selectedDataset: any;

  @ViewChild(MatTable) table: MatTable<Dataset>;

  constructor(
    private dataService: DataManagementService,
    private genericService: GenericService,
    private usersService: UserManagementService,
    private alertService: AlertsService,
    private policyService: PolicyManagementService
  ) {}

  ngOnInit(): void {
    this.updateForm = new FormGroup({
      organisation: new FormControl('', Validators.required),
      department: new FormControl('', Validators.required),
      designation: new FormControl('', Validators.required),
    });
    this.getRequesterDetails();
  }

  applyFilter(event: Event, type: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (type === 'other') {
      this.otherDatasets.filter = filterValue.trim().toLowerCase();
    } else {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  // Toggle relevant sections based on user actions
  updateView(section: string) {
    if (section === 'profile') {
      this.isProfile = true;
      this.isAllowedData = false;
      this.isOtherData = false;
    } else if (section === 'alloweddata') {
      this.isProfile = false;
      this.isOtherData = false;
      this.isAllowedData = true;
      if (!this.dataSource) {
        this.getApprovedDatasets();
      }
    } else if (section === 'alldata') {
      this.isProfile = false;
      this.isAllowedData = false;
      this.isOtherData = true;
      if (!this.otherDatasets) {
        this.getOtherDatasets();
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

  async getRequesterDetails() {
    try {
      let requester: DataRequester =
        await this.usersService.getRequesterDetails();
      this.dataRequester = requester;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Failed to get requester information'
      );
    }
  }

  async getOtherDatasets() {
    let datasets = await this.dataService.filteredDatasets();
    this.otherDatasets = new MatTableDataSource(datasets);
  }

  async getApprovedDatasets() {
    let datasets = await this.dataService.filtertedApprovedDatasets();
    this.dataSource = new MatTableDataSource(datasets);
  }

  async policyMatching(policy: string) {
    try {
      let stringifiedPolicies = this.genericService.bytesToString(policy);
      let policiesInJSONFormat = JSON.parse(stringifiedPolicies);

      // Checking all any case
      let orgname = policiesInJSONFormat[0]['organisation']['name'];
      let depname =
        policiesInJSONFormat[0]['organisation']['departments'][0]['name'];
      let designation =
        policiesInJSONFormat[0]['organisation']['departments'][0][
          'designations'
        ][0];
      if (orgname === 'any' && depname === 'any' && designation === 'any') {
        return true;
      }
      let matchedOrganisation = policiesInJSONFormat.find(
        (policy: any) =>
          policy.organisation.name.toLowerCase() ===
            this.dataRequester.organisation.toLowerCase() ||
          policy.organisation.name.toLowerCase() === 'any'
      );

      if (!matchedOrganisation) {
        return false;
      }

      let { departments } = matchedOrganisation['organisation'];
      let matchedDepartment = departments.find(
        (dep: any) =>
          dep.name.toLowerCase() ===
            this.dataRequester.department.toLowerCase() ||
          dep.name.toLowerCase() === 'any'
      );

      if (!matchedDepartment) {
        return false;
      }
      let { designations } = matchedDepartment;
      let isValidRole =
        designations.includes(this.dataRequester.designation) ||
        designations.includes('any');
      if (isValidRole) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
    }
  }

  async checkAccess(dataRowItem: any) {
    try {
      let returnedPolicy = await this.policyService.getPolicybyDataId(
        dataRowItem.dataid
      );
      let isPolicyMatched = await this.policyMatching(returnedPolicy);
      if (!isPolicyMatched) {
        this.alertService.alertErrorMessage(
          'Your access to this dataset is invalid'
        );
        return;
      }
      if (isPolicyMatched) {
        // let index = this.dataSource.filteredData.inde
        let dataowner = await this.dataService.getDatasetOwner(
          dataRowItem.dataid
        );
        this.policyMatch = true;
        await this.dataService.submitKeyRequest(
          dataRowItem.dataid,
          dataowner,
          'policy match'
        );
      }
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async onSubmit() {
    try {
      this.isLoading = true;
      let { organisation, department, designation } = this.updateForm.value;
      if (!organisation || !department || !designation) return;
      organisation = this.genericService.stringToBytes(
        organisation.toLowerCase()
      );
      department = this.genericService.stringToBytes(department.toLowerCase());
      designation = this.genericService.stringToBytes(
        designation.toLowerCase()
      );
      let connecteduser = await this.genericService.getConnectedUser();
      let txnConfirmation = await this.usersService.updateDataRequester(
        connecteduser,
        organisation,
        department,
        designation
      );
      if (txnConfirmation && txnConfirmation.confirmations === 1) {
        this.isLoading = false;
        this.resetForms();
        this.displayForm = false;
        this.getRequesterDetails();
        this.alertService.alertSuccessMessage('Request submitted successfully');
      }
    } catch (error: any) {
      console.log(error);
      this.isLoading = false;
      this.alertService.alertSuccessMessage(error.data.message);
    }
  }

  resetForms() {
    this.updateForm.reset();
  }

  async decrypt(element: any) {
    try {
      this.selectedDataset = await this.dataService.decryptData(element);
    } catch (error) {}
  }
}
