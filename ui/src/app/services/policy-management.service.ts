import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import Policies from '../abis/Policies.json';

@Injectable({
  providedIn: 'root',
})
export class PolicyManagementService {
  policyContractAddress = '0x8eDd13A15c1DFf87440fe8e7a0D23341951Ae802';
  policyContract: any;
  constructor(private genericService: GenericService) {
    this.policyContract = this.genericService.createContract(
      this.policyContractAddress,
      Policies.abi
    );
  }

  async setPolicy(dataid: string, policy: string) {
    try {
      let policycontract = await this.policyContract;
      let bytesConvertedPolicy = this.genericService.stringToBytes(policy);
      let txn = await policycontract.createPolicy(dataid, bytesConvertedPolicy);
      let txnconfirmation = txn.wait();
      return txnconfirmation;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPolicybyDataId(dataid: string) {
    try {
      let policycontract = await this.policyContract;
      let returnedPolicy = await policycontract.getPolicy(dataid);
      return returnedPolicy;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
