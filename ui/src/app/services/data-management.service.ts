import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { encrypt } from '@metamask/eth-sig-util';
import { AlertsService } from './alerts.service';
import { ServerService } from './server.service';
import { GenericService } from './generic.service';
import { UserManagementService } from './user-management.service';

import Data from '../abis/Data.json';
declare let window: any;
@Injectable({
  providedIn: 'root',
})
export class DataManagementService {
  dataContractAddress = environment.dataContractAddress;
  dataContract: any;

  constructor(
    private alertService: AlertsService,
    private serverService: ServerService,
    private genericService: GenericService,
    private usersService: UserManagementService
  ) {
    this.dataContract = this.genericService.createContract(
      this.dataContractAddress,
      Data.abi
    );
  }

  async addDataset(id: string, name: string, value: string, category: string) {
    try {
      let dataname = this.genericService.stringToBytes(name);
      let datavalue = this.genericService.stringToBytes(value);
      let datacategory = this.genericService.stringToBytes(category);
      let datacontract = await this.dataContract;
      let transactionHash = await datacontract.addData(
        id,
        dataname,
        datavalue,
        datacategory
      );
      let confirmation = await transactionHash.wait();
      return confirmation;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }

  async updateDataset(
    id: string,
    name: string,
    value: string,
    category: string
  ) {
    try {
      let dataname = this.genericService.stringToBytes(name);
      let datavalue = this.genericService.stringToBytes(value);
      let datacategory = this.genericService.stringToBytes(category);
      let datacontract = await this.dataContract;
      let transactionHash = await datacontract.updateData(
        id,
        dataname,
        datavalue,
        datacategory
      );
      let confirmation = await transactionHash.wait();
      return confirmation;
    } catch (error) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }

  async getUserData() {
    try {
      let datacontract = await this.dataContract;
      let datasets = await datacontract.getUserData();
      let structuredDatasets = datasets.map((dataset: any) => ({
        dataid: dataset.id,
        address: dataset.ownerAddress,
        name: this.genericService.bytesToString(dataset.name),
        value: this.genericService.bytesToString(dataset.value),
        category: this.genericService.bytesToString(dataset.category),
      }));
      let reversedDatasets = [...structuredDatasets].reverse();
      return reversedDatasets;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }

  async getAllDatasets() {
    try {
      let datacontract = await this.dataContract;
      let dataevents = await datacontract.queryFilter('DatasetAdded');
      let structuredEvents = dataevents.map((event: any) => {
        let [id, name, value, category] = [...event.args];
        return {
          dataid: id,
          name: this.genericService.bytesToString(name),
          value: this.genericService.bytesToString(value),
          category: this.genericService.bytesToString(category),
        };
      });
      let reversedEvents = [...structuredEvents].reverse();
      return reversedEvents;
    } catch (error: any) {
      console.log(error);
    }
  }

  async submitKeyRequest(dataid: string, ownerAddress: string, type: string) {
    try {
      let datacontract = await this.dataContract;
      type = this.genericService.stringToBytes(type);
      let txn = await datacontract.requestKey(dataid, ownerAddress, type);
      let txnconfirmation = await txn.wait();
      return txnconfirmation;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getDatasetOwner(dataid: string) {
    try {
      let datacontract = await this.dataContract;
      let ownerAddress = await datacontract.getDatasetOwner(dataid);
      return ownerAddress;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getKeyRequests() {
    try {
      let datacontract = await this.dataContract;
      let dataevents = await datacontract.queryFilter('KeyRequested');
      let structuredEvents = dataevents.map((event: any) => {
        let [id, _, requesterAddress, accessType] = [...event.args];
        return {
          dataid: id,
          requesterAddress: requesterAddress,
          accessType: this.genericService.bytesToString(accessType),
        };
      });
      let reversedEvents = [...structuredEvents].reverse();
      return reversedEvents;
    } catch (error: any) {
      this.alertService.alertErrorMessage(error.message);
      console.log(error);
    }
  }

  async getApprovedRequestsOwner() {
    try {
      let datacontract = await this.dataContract;
      let connecteduser = await this.genericService.getConnectedUser();
      let filterTrue = datacontract.filters.ApproveKeyRequest(
        null,
        connecteduser,
        null,
        null
      );
      let approvevents = await datacontract.queryFilter('ApproveKeyRequest');
      let structuredEvents = approvevents.map((event: any) => {
        let [id, ownerAddress, requesterAddress, key] = [...event.args];
        return {
          dataid: id,
          ownerAddress: ownerAddress,
          requesterAddress: requesterAddress,
          key: this.genericService.bytesToString(key),
        };
      });
      return structuredEvents;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getApprovedRequestsRequester() {
    try {
      let datacontract = await this.dataContract;
      let connecteduser = await this.genericService.getConnectedUser();
      let filterTrue = datacontract.filters.ApproveKeyRequest(
        null,
        null,
        connecteduser,
        null
      );
      let approvevents = await datacontract.queryFilter('ApproveKeyRequest');
      let structuredEvents = approvevents.map((event: any) => {
        let [id, ownerAddress, requesterAddress, key] = [...event.args];
        return {
          dataid: id,
          ownerAddress: ownerAddress,
          requesterAddress: requesterAddress,
          key: this.genericService.bytesToString(key),
        };
      });
      let reversedEvents = [...structuredEvents].reverse();
      return reversedEvents;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async mergeArrays(a1: any, a2: any) {
    // this function is adopted from
    // https://stackoverflow.com/questions/46849286/merge-two-array-of-objects-based-on-a-key
    let merged = a1.map((item: any) => ({
      ...a2.find((data: any) => item.dataid === data.dataid && item),
      ...item,
    }));
    return merged;
  }

  async filtertedApprovedDatasets() {
    let alldatasets = await this.getAllDatasets();
    let approvedrequests: any = await this.getApprovedRequestsRequester();
    let filteredRequests = alldatasets?.filter((req: any) =>
      approvedrequests.some(
        (approvedrequest: any) => approvedrequest.dataid === req.dataid
      )
    );
    let mergedarray = await this.mergeArrays(
      filteredRequests,
      approvedrequests
    );
    return mergedarray;
  }

  async filteredDatasets() {
    let alldatasets = await this.getAllDatasets();
    let approvedrequests: any = await this.getApprovedRequestsRequester();
    let filteredRequests = alldatasets?.filter(
      (req: any) =>
        !approvedrequests.some(
          (approvedrequest: any) => approvedrequest.dataid === req.dataid
        )
    );
    return filteredRequests;
  }

  async filteredKeyRequests() {
    let keyrequests = await this.getKeyRequests();
    let approvedrequests = await this.getApprovedRequestsOwner();
    let filteredRequests = keyrequests?.filter(
      (req: any) =>
        !approvedrequests.some(
          (approvedrequest: any) =>
            approvedrequest.dataid === req.dataid &&
            approvedrequest.requesterAddress === req.requesterAddress
        )
    );

    return filteredRequests;
  }

  async approveRequest(dataid: string, requesterAddress: string) {
    try {
      let datacontract = await this.dataContract;
      let requesterPublickey = await this.usersService.getPublicKey(
        requesterAddress
      );
      requesterPublickey =
        this.genericService.bytesToString(requesterPublickey);

      let mykey = await this.serverService.getKeybyId(dataid);
      mykey.subscribe(async (data: any) => {
        console.log('key is');
        console.log(data);
        let encryptedKey: any = await this.encryptData(
          data.key,
          requesterPublickey
        );
        encryptedKey = this.genericService.stringToBytes(
          JSON.stringify(encryptedKey)
        );
        let txn = await datacontract.approveKeyRequest(
          dataid,
          requesterAddress,
          encryptedKey
        );
        let txnconfirmation = txn.wait();
        return txnconfirmation;
      });
      // let key = await this.serverService.getAllKeys();
      // key.subscribe(async (keys: any) => {
      //   let matchedDataItem = keys.find((key: any) => key.dataid === dataid);
      //   let encryptedKey: any = await this.encryptData(
      //     matchedDataItem.key,
      //     requesterPublickey
      //   );
      //   encryptedKey = this.genericService.stringToBytes(
      //     JSON.stringify(encryptedKey)
      //   );
      //   let txn = await datacontract.approveKeyRequest(
      //     dataid,
      //     requesterAddress,
      //     encryptedKey
      //   );
      //   let txnconfirmation = txn.wait();
      //   return txnconfirmation;
      // });
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async encryptData(datakey: string, publicKey: string) {
    try {
      const encrypted = encrypt({
        publicKey: publicKey,
        data: datakey,
        version: 'x25519-xsalsa20-poly1305',
      });
      return encrypted;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async decryptData(data: any) {
    let encryptedkey = JSON.parse(data.key);
    let value = data.value;
    let user = await this.genericService.getConnectedUser();
    const structuredData = {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: encryptedkey.ephemPublicKey,
      nonce: encryptedkey.nonce,
      ciphertext: encryptedkey.ciphertext,
    };

    const ciphertext = `0x${Buffer.from(
      JSON.stringify(structuredData),
      'utf8'
    ).toString('hex')}`;

    const decrypt = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [ciphertext, user],
    });
    let bytes = CryptoJS.AES.decrypt(value, decrypt);
    let decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    return {
      dataid: data.dataid,
      name: data.name,
      value: decryptedValue,
      category: data.category,
    };
  }
}
