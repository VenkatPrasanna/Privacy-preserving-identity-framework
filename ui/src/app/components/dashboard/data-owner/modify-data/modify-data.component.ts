import { Component, Inject, OnInit, NgZone } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';

import { v4 as uuidv4 } from 'uuid';
import { ServerService } from '../../../../services/server.service';
import { DataManagementService } from 'src/app/services/data-management.service';
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModifyDataComponent>,
    private serverService: ServerService,
    private dataService: DataManagementService,
    private alertsService: AlertsService
  ) {}

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
      let key = '';
      let id = '';
      this.isLoading = true;
      let { name, value, category } = this.dataForm.value;
      if (!name || !value || !category) return;

      if (this.data.type === 'Add') {
        key = await this.getGeneratedKey();
        id = this.generateDataID();
        if (!key || !id) return;
        let encryptedValue = await this.encryptDataItemValue(key, value);
        let keyObj = { dataid: id, key: key };
        let addKeyResponse = await this.serverService.submitNewKey(keyObj);
        addKeyResponse.subscribe(async (data: HttpResponse<{}>) => {
          if (data.status === 201) {
            let txnconfirmation = await this.dataService.addDataset(
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
      } else if (this.data.type === 'Update') {
        id = this.data.dataset.dataid;
        let returnedKey = await this.serverService.getKeybyId(id);
        returnedKey.subscribe(async (data: any) => {
          if (data) {
            let key = data.key;
            let encryptedValue = await this.encryptDataItemValue(key, value);
            let txnconfirmation = await this.dataService.updateDataset(
              id,
              name,
              encryptedValue,
              category
            );
            if (txnconfirmation.confirmations === 1) {
              this.isLoading = false;
              this.alertsService.alertSuccessMessage(
                'Data is updated successfully'
              );
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
      }
    } catch (error) {
      this.isLoading = false;
      this.alertsService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }
}
