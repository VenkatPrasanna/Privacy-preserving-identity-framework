import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { ethers } from 'ethers';

import * as CryptoJS from 'crypto-js';

//import {} from "ascii85";
import { encrypt } from '@metamask/eth-sig-util';
//import { createPath } from '../abis/copy.abis';
import { AlertsService } from './alerts.service';
import { ServerService } from './server.service';
import { GenericService } from './generic.service';
import { OrganisationsManagementService } from './organisations-management.service';
import Users from '../abis/Users.json';
import Data from '../abis/Data.json';

declare let window: any;

export interface DataOwner {
  ownerAddress: string;
  profession: string;
  location: string;
  approved: boolean;
}

export interface DataRequester {
  requesterAddress: string;
  organisation: string;
  department: string;
  designation: string;
  approved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConnectService {
  ethereum = window.ethereum;
  durationInSeconds: Number = 5;

  userContractAddress = '0x61DE6Fc675D07b227116DeFB970A0Dfb18b0a6f3';
  dataContractAddress = '0xb5D73fFc4c6Be887658c74F80388686D2281d2e0';

  userContract: any;
  dataContract: any;
  policiesContract: any;

  encryptionKey: any;
  constructor(
    private _snackBar: MatSnackBar,
    private alertService: AlertsService,
    private serverService: ServerService,
    private genericService: GenericService,
    private orgService: OrganisationsManagementService
  ) {
    this.userContract = this.createContract(
      this.userContractAddress,
      Users.abi
    );

    this.dataContract = this.createContract(this.dataContractAddress, Data.abi);

    //this.getEncryptionkey();
    //this.encryptData();
  }

  async createContract(address: string, abi: any) {
    try {
      let provider = new ethers.providers.Web3Provider(this.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, abi, signer);
      return contract;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllUsers() {
    let usercontract = await this.userContract;
    let users = await usercontract.getAllUsers();
    let structuredUsers = users.map((user: any) => ({
      address: user.userAddress,
      role: ethers.BigNumber.from(user.role).toNumber(),
      //approved: user.approved,
    }));

    return structuredUsers;
  }

  // Data owner related opertaions
  async addOwner(address: string, profession: string, location: string) {
    try {
      let usercontract = await this.userContract;

      let transactionHash = await usercontract.addDataOwner(
        address,
        profession,
        location
      );
      // console.log(`Loading - ${transactionHash.hash}`);

      let txnconfirmation = await transactionHash.wait();
      //console.log(`Success - ${transactionHash.hash}`);
      return txnconfirmation;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.data.message);
    }
  }

  async updateDataOwner(address: string, profession: string, location: string) {
    try {
      let usercontract = await this.userContract;

      let transactionHash = await usercontract.updateDataOwner(
        address,
        profession,
        location
      );
      // console.log(`Loading - ${transactionHash.hash}`);

      await transactionHash.wait();
      //console.log(`Success - ${transactionHash.hash}`);
      this.alertService.alertSuccessMessage('Request submitted successfully');
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.data.message);
    }
  }

  async getDataOwnerDetails(): Promise<DataOwner> {
    try {
      let usercontract = await this.userContract;
      let connecteduser = await this.genericService.getConnectedUser();
      let owner = await usercontract.getDataOwner(connecteduser);

      let structuredOwner = {
        ownerAddress: owner.ownerAddress,
        profession: this.genericService.bytesToString(owner.profession),
        location: this.genericService.bytesToString(owner.location),
        approved: owner.approved,
      };
      return structuredOwner;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.data.message);
      throw error;
    }
  }

  async getOwnerApprovalRequests() {
    let usercontract = await this.userContract;
    let nevents = await usercontract.queryFilter('NewOwnerCreated');
    let structuredEvents = nevents.map((event: any) => {
      let [ownerAddress, profession, location, approved] = [...event.args];
      return {
        ownerAddress: ownerAddress,
        profession: this.genericService.bytesToString(profession),
        location: this.genericService.bytesToString(location),
      };
    });
    return structuredEvents;
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
      // console.log(`Loading - ${transactionHash.hash}`);

      let confirmation = await transactionHash.wait();
      console.log(confirmation);
      // console.log(`Success - ${transactionHash.hash}`);
      return confirmation;
      // this.alertService.alertSuccessMessage('Data added successfully');
    } catch (error: any) {
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
      return structuredDatasets;
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Something went wrong please try again later'
      );
    }
  }

  async addRequester(
    address: string,
    organisation: string,
    department: string,
    designation: string
  ) {
    try {
      let usercontract = await this.userContract;
      let transactionHash = await usercontract.addDataRequester(
        address,
        organisation,
        department,
        designation
      );

      let txnconfirmation = await transactionHash.wait();
      await this.orgService.createOrganisation(
        organisation,
        department,
        designation
      );
      return txnconfirmation;
    } catch (error: any) {
      console.log(error.message);
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getRequesterDetails(): Promise<DataRequester> {
    try {
      let usercontract = await this.userContract;
      let connecteduser = await this.genericService.getConnectedUser();
      let requester = await usercontract.getDataRequester(connecteduser);
      let structuredRequester = {
        requesterAddress: requester.requesterAddress.toString(),
        organisation: this.genericService.bytesToString(requester.organisation),
        department: this.genericService.bytesToString(requester.department),
        designation: this.genericService.bytesToString(requester.designation),
        approved: requester.approved,
      };
      return structuredRequester;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllDatasets() {
    try {
      let datacontract = await this.dataContract;
      let dataevents = await datacontract.queryFilter('DatasetAdded');
      let structuredEvents = dataevents.map((event: any) => {
        let [id, name, category] = [...event.args];
        return {
          dataid: id,
          name: this.genericService.bytesToString(name),
          category: this.genericService.bytesToString(category),
        };
      });
      return structuredEvents;
    } catch (error: any) {
      console.log(error);
    }
  }
  async getPublickey() {
    let user = await this.genericService.getConnectedUser();
    const keyb64 = (await this.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [user],
    })) as string;
    // console.log(keyb64);
    // const publicKey = Buffer.from(keyb64, 'base64');
    // this.encryptionKey = publicKey;
    return keyb64;
  }

  async submitKeyRequest(dataid: string, ownerAddress: string, type: string) {
    try {
      let datacontract = await this.dataContract;
      let publickey = await this.getPublickey();
      type = this.genericService.stringToBytes(type);
      publickey = this.genericService.stringToBytes(publickey.toString());
      let txn = await datacontract.requestKey(
        dataid,
        ownerAddress,
        type,
        publickey
      );
      console.log(txn);
    } catch (error) {
      console.log(error);
    }
  }

  async getKeyRequests() {
    try {
      let datacontract = await this.dataContract;
      let dataevents = await datacontract.queryFilter('KeyRequested');
      let structuredEvents = dataevents.map((event: any) => {
        let [id, _, requesterAddress, accessType, publicKey] = [...event.args];
        return {
          dataid: id,
          requesterAddress: requesterAddress,
          accessType: this.genericService.bytesToString(accessType),
          publicKey: this.genericService.bytesToString(publicKey),
        };
      });
      return structuredEvents;
    } catch (error) {
      console.log(error);
    }
  }

  async approveRequest(
    dataid: string,
    requeterAddress: string,
    publicKey: string
  ) {
    try {
      let datacontract = await this.dataContract;
      let key = await this.serverService.getAllKeys();
      key.subscribe(async (keys: any) => {
        let matchedDataItem = keys.find((key: any) => key.dataid === dataid);
        let encryptedKey: any = await this.encryptData(
          matchedDataItem.key,
          publicKey
        );
        encryptedKey = this.genericService.stringToBytes(
          JSON.stringify(encryptedKey)
        );
        let txn = await datacontract.approveKeyRequest(
          dataid,
          requeterAddress,
          encryptedKey
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  async encryptData(datakey: string, publicKey: string) {
    try {
      const enc = encrypt({
        publicKey: publicKey,
        data: datakey,
        version: 'x25519-xsalsa20-poly1305',
      });
      return enc;
    } catch (error) {
      console.log(error);
    }
  }

  async getDecryptionkey() {
    try {
      let datacontract = await this.dataContract;
      let approvedRequests = await datacontract.queryFilter(
        'ApproveKeyRequest'
      );

      let structuredEvents = approvedRequests.map((event: any) => {
        let [id, requesterAddress, key] = [...event.args];
        return {
          dataid: id,
          requesterAddress: requesterAddress,
          publicKey: this.genericService.bytesToString(key),
        };
      });
      let event = structuredEvents[0];
      let parsedkey = JSON.parse(event.publicKey);
      let data = await this.decryptData(parsedkey);

      let bytes = CryptoJS.AES.decrypt(
        'U2FsdGVkX19BoheaGoNd3Gv3VVy8mhON6/KTQdbzVFE3u9BpiShluaxuJvWe6qt/',
        data
      );
      let originalText = bytes.toString(CryptoJS.enc.Utf8);
      console.log(originalText);
    } catch (error) {
      console.log(error);
    }
  }

  async decryptData(parsedkey: any) {
    const structuredData = {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: parsedkey.ephemPublicKey,
      nonce: parsedkey.nonce,
      ciphertext: parsedkey.ciphertext,
    };

    const ct = `0x${Buffer.from(
      JSON.stringify(structuredData),
      'utf8'
    ).toString('hex')}`;

    let user = await this.genericService.getConnectedUser();
    const decrypt = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [ct, user],
    });
    return decrypt;
  }
  // async encryptData() {
  //   let data1 = 'VenkatPravas';
  //   let data2 = 'lakshmi';
  //   let key = 'password';

  //   // let user = await this.getConnectedUser();
  //   // console.log(user);

  //   let cp1 = CryptoJS.AES.encrypt(data1, key).toString();
  //   let cp2 = CryptoJS.AES.encrypt(data2, key).toString();

  //   console.log(cp1);
  //   let buffcp1 = Buffer.from(cp1, 'utf-8');

  //   //this.decryption(cp1, cp2);

  //   const keyb64 = (await this.ethereum.request({
  //     method: 'eth_getEncryptionPublicKey',
  //     params: ['0x7d84b6e05C80B5791b0072631087EC63B3168e4C'],
  //   })) as string;
  //   const publicKey = Buffer.from(keyb64, 'base64');
  //   this.encryptionKey = publicKey;

  //   const enc = encrypt({
  //     publicKey: this.encryptionKey.toString('base64'),
  //     data: cp1,
  //     version: 'x25519-xsalsa20-poly1305',
  //   });

  //   const buf = Buffer.concat([
  //     Buffer.from(enc.ephemPublicKey, 'base64'),
  //     Buffer.from(enc.nonce, 'base64'),
  //     Buffer.from(enc.ciphertext, 'base64'),
  //   ]);

  //   console.log(enc);
  //   console.log(buf);

  //   this.decryptData2(buf);
  // }

  // async decryptData2(data: Buffer) {
  //   const structuredData = {
  //     version: 'x25519-xsalsa20-poly1305',
  //     ephemPublicKey: data.slice(0, 32).toString('base64'),
  //     nonce: data.slice(32, 56).toString('base64'),
  //     ciphertext: data.slice(56).toString('base64'),
  //   };

  //   const ct = `0x${Buffer.from(
  //     JSON.stringify(structuredData),
  //     'utf8'
  //   ).toString('hex')}`;

  //   const decrypt = await window.ethereum.request({
  //     method: 'eth_decrypt',
  //     params: [ct, '0x7d84b6e05C80B5791b0072631087EC63B3168e4C'],
  //   });

  //   let bytes = CryptoJS.AES.decrypt(decrypt, 'password');
  //   let originalText = bytes.toString(CryptoJS.enc.Utf8);
  //   console.log(decrypt, originalText);
  // }

  // async decryption(data1: string, data2: string) {
  //   let key = 'password';
  //   let bytes = CryptoJS.AES.decrypt(data1, key);
  //   let bytes2 = CryptoJS.AES.decrypt(data2, key);
  //   let originalText = bytes.toString(CryptoJS.enc.Utf8);
  //   let originalText2 = bytes2.toString(CryptoJS.enc.Utf8);

  //   console.log(originalText, originalText2);
  // }

  // async disconnect() {
  //   try {
  //     const r = await this.ethereum.on('disconnect');
  //     console.log(r);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
