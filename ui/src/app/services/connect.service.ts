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
import Users from '../abis/Users.json';

declare let window: any;
@Injectable({
  providedIn: 'root',
})
export class ConnectService {
  ethereum = window.ethereum;
  durationInSeconds: Number = 5;

  userContractAddress = '0xB60e5b1c7FE6192701746EB1C539b6Ee98772b8c';
  userContract: any;

  encryptionKey: any;
  constructor(
    private _snackBar: MatSnackBar,
    private alertService: AlertsService
  ) {
    this.ethereum.on('accountsChanged', (accounts: any) => {
      window.location.reload();
    });

    this.userContract = this.createContract(
      this.userContractAddress,
      Users.abi
    );

    //this.getEncryptionkey();
    this.encryptData();
  }

  // openSnackBar(message: any) {
  //   this._snackBar.open(message.message, '', {
  //     horizontalPosition: 'center',
  //     verticalPosition: 'top',
  //     duration: 4000,
  //     panelClass: ['snackbar-danger'],
  //   });
  // }

  stringToBytes32(str: string) {
    const buffstr = Buffer.from(str).toString('hex');
    return '0x' + buffstr + '0'.repeat(64 - buffstr.length);
  }

  bytes32ToString(bytes: any) {
    return Buffer.from(bytes.slice(2).split('00')[0], 'hex').toString();
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

  async connectWallet() {
    try {
      if (!window.ethereum) return alert('Please install metamask');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('sjhfd');
      return accounts[0];
      //let users = this.getAllUsers();
    } catch (error: any) {
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getConnectedUser() {
    try {
      if (!window.ethereum) return alert('Please install metamask');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      return accounts[0];
      //let users = this.getAllUsers();
    } catch (error: any) {
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async isUserConnected() {
    let provider = new ethers.providers.Web3Provider(this.ethereum);
    if (provider._isProvider) {
      let account = await provider.listAccounts();
      return account.length > 0;
    }
    return;
  }

  async getAllUsers() {
    let usercontract = await this.userContract;
    let users = await usercontract.getAllUsers();
    let structuredUsers = users.map((user: any) => ({
      address: user.userAddress,
      role: user.role,
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

  async getOwner() {
    try {
      let usercontract = await this.userContract;
      let owner = await usercontract.getDataOwner(
        '0x69632Dd67F25DaBEf66050504eb153d81Cc39143'
      );
      let structuredOwner = {
        profession: this.bytes32ToString(owner.profession),
        location: this.bytes32ToString(owner.location),
      };
      console.log(structuredOwner);
    } catch (error: any) {
      console.log(error);
      this.alertService.alertErrorMessage(error.data.message);
    }
  }

  async getOwnerApprovalRequests() {
    let usercontract = await this.userContract;
    let nevents = await usercontract.queryFilter('NewOwnerCreated');
    let structuredEvents = nevents.map((event: any) => {
      let [ownerAddress, profession, location, approved] = [...event.args];
      return {
        ownerAddress: ownerAddress,
        profession: this.bytes32ToString(profession),
        location: this.bytes32ToString(location),
      };
    });
    return structuredEvents;
  }

  //async addRequester(address: string);
  async getEncryptionkey() {
    let user = await this.getConnectedUser();
    console.log(user);
    const keyb64 = (await this.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [user],
    })) as string;
    const publicKey = Buffer.from(keyb64, 'base64');
    this.encryptionKey = publicKey;
    console.log(publicKey);
  }

  async encryptData() {
    let data1 = 'VenkatPravas';
    let data2 = 'lakshmi';
    let key = 'password';

    // let user = await this.getConnectedUser();
    // console.log(user);

    let cp1 = CryptoJS.AES.encrypt(data1, key).toString();
    let cp2 = CryptoJS.AES.encrypt(data2, key).toString();

    console.log(cp1);
    let buffcp1 = Buffer.from(cp1, 'utf-8');

    //this.decryption(cp1, cp2);

    const keyb64 = (await this.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: ['0x7d84b6e05C80B5791b0072631087EC63B3168e4C'],
    })) as string;
    const publicKey = Buffer.from(keyb64, 'base64');
    this.encryptionKey = publicKey;

    const enc = encrypt({
      publicKey: this.encryptionKey.toString('base64'),
      data: cp1,
      version: 'x25519-xsalsa20-poly1305',
    });

    const buf = Buffer.concat([
      Buffer.from(enc.ephemPublicKey, 'base64'),
      Buffer.from(enc.nonce, 'base64'),
      Buffer.from(enc.ciphertext, 'base64'),
    ]);

    console.log(enc);
    console.log(buf);

    this.decryptData2(buf);
  }

  async decryptData2(data: Buffer) {
    const structuredData = {
      version: 'x25519-xsalsa20-poly1305',
      ephemPublicKey: data.slice(0, 32).toString('base64'),
      nonce: data.slice(32, 56).toString('base64'),
      ciphertext: data.slice(56).toString('base64'),
    };

    const ct = `0x${Buffer.from(
      JSON.stringify(structuredData),
      'utf8'
    ).toString('hex')}`;

    const decrypt = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [ct, '0x7d84b6e05C80B5791b0072631087EC63B3168e4C'],
    });

    let bytes = CryptoJS.AES.decrypt(decrypt, 'password');
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    console.log(decrypt, originalText);
  }

  async decryption(data1: string, data2: string) {
    let key = 'password';
    let bytes = CryptoJS.AES.decrypt(data1, key);
    let bytes2 = CryptoJS.AES.decrypt(data2, key);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    let originalText2 = bytes2.toString(CryptoJS.enc.Utf8);

    console.log(originalText, originalText2);
  }

  async disconnect() {
    try {
      const r = await this.ethereum.on('disconnect');
      console.log(r);
    } catch (error) {
      console.log(error);
    }
  }
}
