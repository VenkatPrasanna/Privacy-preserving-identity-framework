import { Component, Inject, OnInit, NgZone, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

import { v4 as uuidv4 } from 'uuid';
import { ServerService } from '../../../../services/server.service';
import { ConnectService } from '../../../../services/connect.service';
import { GenericService } from '../../../../services/generic.service';
import { AlertsService } from '../../../../services/alerts.service';

@Component({
  selector: 'app-modify-data',
  templateUrl: './modify-data.component.html',
  styleUrls: ['./modify-data.component.css'],
})
export class ModifyDataComponent implements OnInit {
  dataForm: any;
  categories: string[] = [];
  isLoading = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<ModifyDataComponent>,
    private _ngZone: NgZone,
    private serverService: ServerService,
    private connectService: ConnectService,
    private genericService: GenericService,
    private alertsService: AlertsService
  ) {}

  //@ViewChild('autosize') autosize: CdkTextareaAutosize;

  ngOnInit(): void {
    this.categories = this.data.categories;
    this.dataForm = new FormGroup({
      name: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
    });

    this.generateDataID();
  }

  generateDataID() {
    let id = uuidv4();
    id = id.split('-').join('');
    return id;
  }

  async getGeneratedKey() {
    let key = await this.serverService.getKey();
    return key.toString();
  }

  async encryptDataItemValue(key: string, value: string) {
    let encryptedValue = CryptoJS.AES.encrypt(value, key).toString();
    return encryptedValue;
  }

  async onDataSubmit() {
    try {
      this.isLoading = true;
      let { name, value, category } = this.dataForm.value;
      let id = this.generateDataID();
      let key = await this.getGeneratedKey();

      if (!name || !value || !category || !id || !key) return;

      let encryptedValue = await this.encryptDataItemValue(key, value);
      let keyObj = { dataid: id, key: key };
      let addKeyResponse = await this.serverService.submitNewKey(keyObj);
      addKeyResponse.subscribe(async (data: HttpResponse<{}>) => {
        console.log(data.status);
        if (data.status === 201) {
          let txnconfirmation = await this.connectService.addDataset(
            id,
            name,
            encryptedValue,
            category
          );

          if (txnconfirmation.confirmations === 1) {
            this.isLoading = false;
            this.alertsService.alertSuccessMessage(
              'Data is added successfully'
            );
          } else {
          }
          this.dialogRef.close({
            dataid: id,
            address: '',
            name: name,
            value: encryptedValue,
            category: category,
          });
        }
      });

      // let decryptData = CryptoJS.AES.decrypt(encryptedValue, key.toString());
      // let f = decryptData.toString(CryptoJS.enc.Utf8);
      // console.log('dec data', f);
    } catch (error) {
      this.isLoading = false;
      this.alertsService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }
  // triggerResize() {
  //   // Wait for changes to be applied, then trigger textarea resize.
  //   this._ngZone.onStable
  //     .pipe(take(1))
  //     .subscribe(() => this.autosize.resizeToFitContent(true));
  // }
}
