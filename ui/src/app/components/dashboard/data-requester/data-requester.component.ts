import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConnectService } from '../../../services/connect.service';
import { GenericService } from '../../../services/generic.service';
import { ServerService } from '../../../services/server.service';
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
  isProfile: boolean = true;
  isAllowedData: boolean = false;
  isOtherData: boolean = false;
  displayedColumns: string[] = ['dataid', 'name', 'category', 'actions'];
  dataSource: any;
  policyMatch: boolean = false;
  @ViewChild(MatTable) table: MatTable<Dataset>;
  constructor(
    private connectService: ConnectService,
    private genericService: GenericService,
    private serverService: ServerService,
    private usersService: UserManagementService,
    private alertService: AlertsService,
    private policyService: PolicyManagementService
  ) {}

  ngOnInit(): void {
    this.getRequesterDetails();
    this.getAllDatasets();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async getRequesterDetails() {
    try {
      let requester: DataRequester =
        await this.usersService.getRequesterDetails();
      this.dataRequester = requester;
      this.dataRequester.approved = true;
      if (this.dataRequester.approved) {
        console.log('Requester is approved');
      } else {
        console.log('Requster is not approved');
      }
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Failed to get requester information'
      );
    }
  }

  async getAllDatasets() {
    let datasets = await this.connectService.getAllDatasets();
    this.dataSource = new MatTableDataSource(datasets);
  }

  async policyMatching(policy: string) {
    try {
      let stringifiedPolicies = this.genericService.bytesToString(policy);
      let policiesInJSONFormat = JSON.parse(stringifiedPolicies);
      let matchedOrganisation = policiesInJSONFormat.find(
        (policy: any) =>
          policy.organisation.name.toLowerCase() ===
          this.dataRequester.organisation.toLowerCase()
      );
      if (!matchedOrganisation) {
        return false;
      }
      let { departments } = matchedOrganisation['organisation'];
      let matchedDepartment = departments.find(
        (dep: any) =>
          dep.name.toLowerCase() === this.dataRequester.department.toLowerCase()
      );
      if (!matchedDepartment) {
        return false;
      }
      let { designations } = matchedDepartment;
      let isValidRole = designations.includes(this.dataRequester.designation);
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
        console.log('dfgh');
        // let index = this.dataSource.filteredData.inde
        this.policyMatch = true;
        let txn = await this.connectService.submitKeyRequest(
          dataRowItem.dataid,
          '0x69632Dd67F25DaBEf66050504eb153d81Cc39143',
          'policy match'
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async decrypt(element: any) {
    try {
      let txn = await this.connectService.getDecryptionkey();
    } catch (error) {}
  }
}
