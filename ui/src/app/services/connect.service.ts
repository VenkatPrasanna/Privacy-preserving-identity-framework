import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { ethers } from 'ethers';

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

  userContractAddress = '0xf8422c7472B0DF40f1d23658482331BF3D5856a8';
  userContract: any;

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

    this.getOwner();
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
      approved: user.approved,
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
      this.alertService.alertErrorMessage(error.data.message);
    }
  }

  //async addRequester(address: string);

  async disconnect() {
    try {
      const r = await this.ethereum.on('disconnect');
      console.log(r);
    } catch (error) {
      console.log(error);
    }
  }
}
