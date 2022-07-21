import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ethers } from 'ethers';

import { AlertsService } from './alerts.service';
import { GenericService } from './generic.service';
import Users from '../abis/Users.json';

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

export interface UserRequests {
  userAddress: string;
  userType: Number;
  approved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  usersContractAddress = environment.userContractAddress;
  usersContract: any;
  constructor(
    private genericService: GenericService,
    private alertService: AlertsService
  ) {
    this.usersContract = this.genericService.createContract(
      this.usersContractAddress,
      Users.abi
    );
  }

  async getUserRole(userAddress: string): Promise<Number> {
    try {
      let usercontract = await this.usersContract;
      let txn = await usercontract.getUserRole(userAddress);
      let roleAsNumber = ethers.BigNumber.from(txn).toNumber();
      return roleAsNumber;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPublicKey(requesterAddress: string) {
    try {
      let usercontract = await this.usersContract;
      let key = await usercontract.getPublicKey(requesterAddress);
      return key;
    } catch (error) {
      console.log(error);
    }
  }

  // Data owner related opertaions -- starts
  async addOwner(address: string, profession: string, location: string) {
    try {
      let usercontract = await this.usersContract;
      let transactionHash = await usercontract.addDataOwner(
        address,
        profession,
        location
      );
      let txnconfirmation = await transactionHash.wait();
      return txnconfirmation;
    } catch (error: any) {
      console.log(error);
    }
  }

  async updateDataOwner(address: string, profession: string, location: string) {
    try {
      let usercontract = await this.usersContract;

      let transactionHash = await usercontract.updateDataOwner(
        address,
        profession,
        location
      );
      let txnconfirmation = await transactionHash.wait();
      return txnconfirmation;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getDataOwnerDetails(): Promise<DataOwner> {
    try {
      let usercontract = await this.usersContract;
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
      this.alertService.alertErrorMessage(error.data.message);
      throw error;
    }
  }

  // Data owner related operations - ends

  // Super admin related operations -- starts
  async getUserApprovalRequests() {
    try {
      let usercontract = await this.usersContract;
      let allUsers = await usercontract.getAllUsers();
      let structuredUsers = allUsers.map((user: UserRequests) => ({
        userAddress: user.userAddress,
        userType: ethers.BigNumber.from(user.userType).toNumber(),
        approved: user.approved,
      }));
      let filteredUsers = structuredUsers.filter(
        (user: UserRequests) => user.approved === false
      );
      return filteredUsers;
      // let filterFalse = usercontract.filters.UserUpdated(null, null, null);
      // let filterTrue = usercontract.filters.UserUpdated(null, null, true);
      // let allEvents = await usercontract.queryFilter(filterFalse);

      // console.log(allEvents);
      // allEvents.map(async (event: any) => {
      //   let [userAddress, userType, approved] = [...event.args];
      //   let newFilter = usercontract.filters.UserUpdated(
      //     userAddress,
      //     null,
      //     null
      //   );
      //   console.log('ev', userAddress);
      //   let ev = await usercontract.queryFilter(newFilter);
      //   console.log(ev);
      //   return;
      // });
      // let userUpdateEvents = await usercontract.queryFilter(filterFalse);
      // let structuredEvents = userUpdateEvents.map((event: any) => {
      //   let [userAddress, userType, approved] = [...event.args];
      //   return {
      //     userAddress: userAddress,
      //     userType: ethers.BigNumber.from(userType).toNumber(),
      //     approved: approved,
      //   };
      // });
      //console.log(structuredEvents);
      //return structuredEvents;
    } catch (error: any) {
      this.alertService.alertErrorMessage(error.message);
    }
  }

  async getUserDetails(user: UserRequests) {
    try {
      let usercontract = await this.usersContract;
      if (user.userType === 1) {
        let owner = await usercontract.getDataOwner(user.userAddress);
        let structuredOwner = {
          userAddress: owner.ownerAddress,
          profession: this.genericService.bytesToString(owner.profession),
          location: this.genericService.bytesToString(owner.location),
          approved: owner.approved,
        };
        return structuredOwner;
      } else {
        let requester = await usercontract.getDataRequester(user.userAddress);
        let structuredRequester = {
          userAddress: requester.requesterAddress.toString(),
          organisation: this.genericService.bytesToString(
            requester.organisation
          ),
          department: this.genericService.bytesToString(requester.department),
          designation: this.genericService.bytesToString(requester.designation),
          approved: requester.approved,
        };
        return structuredRequester;
      }
    } catch (error) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Failed to get user attributes. Please try after sometime.'
      );
    }
  }

  async approveUser(user: any) {
    try {
      let usercontract = await this.usersContract;
      if (user.userType === 1) {
        let txn = await usercontract.approveOwner(user.userAddress);
        let txnconfirmation = await txn.wait();
        return txnconfirmation;
      } else {
        let txn = await usercontract.approveRequester(user.userAddress);
        let txnconfirmation = await txn.wait();

        return txnconfirmation;
      }
    } catch (error) {
      console.log(error);
      this.alertService.alertErrorMessage(
        'Failed to approve user, please try after sometime'
      );
    }
  }

  async addCategory(category: string) {
    try {
      let usercontract = await this.usersContract;
      let txn = await usercontract.addCategory(category);
      let txnconfirmation = txn.wait();
      return txnconfirmation;
    } catch (error) {
      console.log(error);
    }
  }

  async getAllCategories() {
    try {
      let usercontract = await this.usersContract;
      let categories = await usercontract.getAllCategories();
      categories = categories.map((category: string) =>
        this.genericService.bytesToString(category)
      );
      return categories;
    } catch (error) {
      console.log(error);
      this.alertService.alertErrorMessage('Failed to fetch categories');
    }
  }
  // super admin related opeartions -- ends

  // Data requester related operations -- starts
  async addRequester(
    address: string,
    organisation: string,
    department: string,
    designation: string
  ) {
    try {
      let usercontract = await this.usersContract;
      let publicKey = await this.genericService.getPublickey();
      publicKey = await this.genericService.stringToBytes(publicKey);
      let transactionHash = await usercontract.addDataRequester(
        address,
        organisation,
        department,
        designation,
        publicKey
      );
      let txnconfirmation = await transactionHash.wait();
      return txnconfirmation;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async updateDataRequester(
    address: string,
    organisation: string,
    department: string,
    designation: string
  ) {
    try {
      let usercontract = await this.usersContract;
      let transactionHash = await usercontract.updateDataRequester(
        address,
        organisation,
        department,
        designation
      );
      let txnconfirmation = await transactionHash.wait();
      return txnconfirmation;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async getRequesterDetails(): Promise<DataRequester> {
    try {
      let usercontract = await this.usersContract;
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
  // Data requester related operations -- ends
}
