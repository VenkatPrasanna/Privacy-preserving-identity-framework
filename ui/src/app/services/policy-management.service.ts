import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import Policies from '../abis/Policies.json';

@Injectable({
  providedIn: 'root',
})
export class PolicyManagementService {
  policyContractAddress = '0x00d96D390e836BBaf0951d7A393a4C58bAceB4b3';
  policyContract: any;
  constructor(private genericService: GenericService) {
    this.policyContract = this.genericService.createContract(
      this.policyContractAddress,
      Policies.abi
    );
  }
}
