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

  stringToBytes(str: string) {
    const buffstr = Buffer.from(str).toString('hex');
    if (buffstr.length >= 64) {
      return '0x' + buffstr;
    }
    return '0x' + buffstr + '0'.repeat(64 - buffstr.length);
  }

  bytesToString(bytes: any) {
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

  async getPublickey() {
    let user = await this.getConnectedUser();
    const keyb64 = (await this.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [user],
    })) as string;
    // console.log(keyb64);
    // const publicKey = Buffer.from(keyb64, 'base64');
    // this.encryptionKey = publicKey;
    return keyb64;
  }
}
