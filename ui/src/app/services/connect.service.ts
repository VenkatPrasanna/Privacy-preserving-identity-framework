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
import Organisations from '../abis/Organisations.json';

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
  location: string;
  approved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConnectService {
  ethereum = window.ethereum;
  durationInSeconds: Number = 5;

  userContractAddress = '0xA47C192b094c68CB3d58f56314FDb328a0b809f1';
  dataContractAddress = '0xd4Ede2d007D93470D5Ed44d41c2b330095D13C6c';

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

      await transactionHash.wait();
      //console.log(`Success - ${transactionHash.hash}`);
      this.alertService.alertSuccessMessage('Request submitted successfully');
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
      console.log(dataname, datavalue, datacategory);
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
        location: this.genericService.bytesToString(requester.designation),
        approved: requester.approved,
      };
      return structuredRequester;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  // async getEncryptionkey() {
  //   let user = await this.getConnectedUser();
  //   console.log(user);
  //   const keyb64 = (await this.ethereum.request({
  //     method: 'eth_getEncryptionPublicKey',
  //     params: [user],
  //   })) as string;
  //   const publicKey = Buffer.from(keyb64, 'base64');
  //   this.encryptionKey = publicKey;
  //   console.log(publicKey);
  // }

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
