import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import Organisations from '../abis/Organisations.json';

@Injectable({
  providedIn: 'root',
})
export class OrganisationsManagementService {
  organisationContractAddress = '0x00d96D390e836BBaf0951d7A393a4C58bAceB4b3';
  organisationContract: any;
  constructor(private genericService: GenericService) {
    this.organisationContract = this.genericService.createContract(
      this.organisationContractAddress,
      Organisations.abi
    );
  }

  // Get All Organisations
  async getAllOrganisations() {
    try {
      let organisationcontract = await this.organisationContract;
      let organisations = await organisationcontract.getAllOrganisations();
      let structuredOrganisations = organisations.map((organisation: any) => ({
        orgid: organisation.orgid,
        orgname: this.genericService.bytesToString(organisation.orgname),
      }));
      return structuredOrganisations;
    } catch (error: any) {
      console.log(error);
    }
  }

  // Fetch all departments
  async getAllDepartments() {
    try {
      let organisationcontract = await this.organisationContract;
      let departments = await organisationcontract.getAllDepartments();
      let structuredDepartments = departments.map((department: any) => ({
        depid: department.depid,
        depname: this.genericService.bytesToString(department.depname),
      }));
      return structuredDepartments;
    } catch (error: any) {
      console.log(error);
    }
  }

  async getAllDesignations() {
    try {
      let organisationcontract = await this.organisationContract;
      let departments = await organisationcontract.getAllDesignations();
      departments = departments.map((designation: string) =>
        this.genericService.bytesToString(designation)
      );
      return departments;
    } catch (error: any) {
      console.log(error);
    }
  }

  async createOrganisation(
    name: string,
    departmentName: string,
    designation: string
  ) {
    let organisationcontract = await this.organisationContract;
    let txn = await organisationcontract.createOrganisation(
      name,
      departmentName,
      designation,
      true
    );
    let txnconfirmation = txn.wait();
    console.log(txnconfirmation);
  }

  async organisationSpecificDepartments(orgid: string) {
    let organisationcontract = await this.organisationContract;
    let fullOrganisationStruct = await organisationcontract.getOrganisation(
      orgid
    );
    // deps.map((dep: any) => {
    //   console.log(dep);
    // });
    let structuredData = {
      orgid: fullOrganisationStruct.orgid,
      orgname: this.genericService.bytesToString(
        fullOrganisationStruct.orgname
      ),
      departmentids: fullOrganisationStruct.departmentids,
    };
    // for (let i = 0; i < stdeps.length; i++) {
    //   let dep = await organisationcontract.getDepartment(stdeps[i]);
    //   let sdep = {
    //     depid: dep.depid,
    //     depname: this.genericService.bytesToString(dep.depname) + ' - ' + orgid,
    //     designations: dep.designations.map(
    //       (des: string) =>
    //         this.genericService.bytesToString(des) +
    //         ' - ' +
    //         orgid +
    //         ' - ' +
    //         dep.depid
    //     ),
    //   };
    //   rdeps.push(sdep);
    // }
    return structuredData;
  }
}
