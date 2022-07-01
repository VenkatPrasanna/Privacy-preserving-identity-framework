import { Injectable } from '@angular/core';
import { ethers } from 'ethers';

import { AlertsService } from './alerts.service';

declare let window: any;

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  ethereum = window.ethereum;
  constructor(private alertService: AlertsService) {
    this.ethereum.on('accountsChanged', (accounts: any) => {
      window.location.reload();
    });
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
    return false;
  }

  stringToBytes32(str: string) {
    const buffstr = Buffer.from(str).toString('hex');
    return '0x' + buffstr + '0'.repeat(64 - buffstr.length);
  }

  bytes32ToString(bytes: any) {
    return Buffer.from(bytes.slice(2).split('00')[0], 'hex').toString();
  }
}
