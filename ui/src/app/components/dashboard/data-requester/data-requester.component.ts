import { Component, OnInit } from '@angular/core';
import { ConnectService } from '../../../services/connect.service';
import { GenericService } from '../../../services/generic.service';
import { ServerService } from '../../../services/server.service';
import { AlertsService } from '../../../services/alerts.service';

export interface DataRequester {
  requesterAddress: string;
  organisation: string;
  department: string;
  location: string;
  approved: boolean;
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
    location: '',
    approved: false,
  };
  isProfile: boolean = true;
  isAllowedData: boolean = false;
  isOtherData: boolean = false;
  constructor(
    private connectService: ConnectService,
    private genericService: GenericService,
    private serverService: ServerService,
    private alertService: AlertsService
  ) {}

  ngOnInit(): void {
    this.getRequesterDetails();
  }

  async getRequesterDetails() {
    try {
      let requester: DataRequester =
        await this.connectService.getRequesterDetails();
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
}
