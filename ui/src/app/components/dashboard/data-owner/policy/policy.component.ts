import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OrganisationsManagementService } from 'src/app/services/organisations-management.service';

export interface Organisation {
  orgid: string;
  orgname: string;
  isAllowed: boolean;
}

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css'],
})
export class PolicyComponent implements OnInit {
  isLoading: boolean = false;
  policyForm: FormGroup;
  allOrganisations: Organisation[] = [];
  allDepartments: any;
  allRoles: any;
  orgsepcdepts: any;
  roles: string[] = [];
  deptSpecRoles: any = [];
  filteredDepartments: any = [];
  filteredRoles: any = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PolicyComponent>,
    private orgService: OrganisationsManagementService
  ) {}

  ngOnInit(): void {
    this.policyForm = new FormGroup({
      dataid: new FormControl(this.data.dataid),
      organisations: new FormControl('', Validators.required),
      departments: new FormControl('', Validators.required),
      designations: new FormControl('', Validators.required),
    });

    this.getAllOrganisations();
    this.getAllDepartments();
    this.getAllDesignations();
  }

  async getAllOrganisations() {
    this.allOrganisations = [{ orgid: 'any', orgname: 'any', isAllowed: true }];
    let returnedOrganisations = await this.orgService.getAllOrganisations();
    returnedOrganisations.map((organisation: Organisation) => {
      organisation.isAllowed = true;
    });
    this.allOrganisations = [
      ...this.allOrganisations,
      ...returnedOrganisations,
    ];
  }

  async getAllDepartments() {
    this.filteredDepartments = [];
    let returnedDepartments = await this.orgService.getAllDepartments();
    returnedDepartments.map((department: any) => {
      department.isAllowed = true;
    });
    this.allDepartments = JSON.parse(
      JSON.stringify([
        { depid: 'any', depname: 'any', isAllowed: true },
        ...returnedDepartments,
      ])
    );
    let otherdeps = JSON.parse(JSON.stringify(returnedDepartments));
    this.filteredDepartments = JSON.parse(
      JSON.stringify([
        { depid: 'any', depname: 'any', isAllowed: true },
        ...otherdeps,
      ])
    );
  }

  async getAllDesignations() {
    try {
      this.filteredRoles = [{ name: 'any', isAllowed: true }];
      let designations = await this.orgService.getAllDesignations();
      designations = designations.map((designation: string) => {
        let designationObj = { name: designation, isAllowed: true };
        return designationObj;
      });
      this.allRoles = [...this.filteredRoles, ...designations];
      this.filteredRoles = [...this.filteredRoles, ...designations];
    } catch (error: any) {
      console.log(error);
    }
  }

  async validateIsAnyOrg(status: boolean) {
    if (status) {
      this.allOrganisations.map((organisation: Organisation) => {
        if (organisation.orgid.toLowerCase() !== 'any') {
          organisation.isAllowed = false;
        }
      });
    } else {
      this.allOrganisations.map((organisation: Organisation) => {
        if (organisation.orgid.toLowerCase() !== 'any') {
          organisation.isAllowed = true;
        }
      });
    }
  }

  async validateIsAnyDepartment(status: boolean) {
    if (status) {
      this.filteredDepartments.map((department: any) => {
        if (department.depid.toLowerCase() !== 'any') {
          department.isAllowed = false;
        }
      });
    } else {
      this.filteredDepartments.map((department: any) => {
        if (department.depid.toLowerCase() !== 'any') {
          department.isAllowed = true;
        }
      });
    }
  }

  async validateIsAnyRole(status: boolean) {
    if (status) {
      this.filteredRoles.map((role: any) => {
        if (role.name.toLowerCase() !== 'any') {
          role.isAllowed = false;
        }
      });
    } else {
      this.filteredRoles.map((role: any) => {
        if (role.name.toLowerCase() !== 'any') {
          role.isAllowed = true;
        }
      });
    }
  }

  async onOrganisationChange() {
    let { dataid, organisations } = this.policyForm.value;
    let isAnyOrg = organisations.includes('any');
    this.validateIsAnyOrg(isAnyOrg);
    this.filteredDepartments = JSON.parse(JSON.stringify([]));
    if (isAnyOrg) {
      console.log(this.allDepartments);
      this.filteredDepartments = JSON.parse(
        JSON.stringify(this.allDepartments)
      );
      return;
    }
    this.orgsepcdepts = [];
    this.roles = [];
    this.deptSpecRoles = [];

    this.filteredRoles = [];
    for (let i = 0; i < organisations.length; i++) {
      let deps = await this.orgService.organisationSpecificDepartments(
        organisations[i]
      );
      let { departmentids } = deps;
      let mappedDepartments: any = [];
      departmentids.map((depid: string) => {
        this.allDepartments.map((department: any) => {
          if (department.depid.toLowerCase() === depid.toLowerCase()) {
            let newdep = JSON.parse(JSON.stringify(department));
            newdep.depname = newdep.depname + ' - ' + deps.orgname;
            this.filteredDepartments.push(newdep);
          }
        });
      });
      // for (let k = 0; k < deps.length; k++) {
      //   this.deptSpecRoles.push(deps[k]);
      //   this.orgsepcdepts.push({
      //     depid: deps[k].depid,
      //     depname: deps[k].depname,
      //   });
      //   this.roles = [...this.roles, ...deps[k].designations];
      // }
    }
  }

  async onDepartmentChange() {
    this.roles = [];
    let { departments } = this.policyForm.value;
    let isAnyDept = departments.includes('any');
    this.validateIsAnyDepartment(isAnyDept);
    if (isAnyDept) {
    }
    for (let i = 0; i < departments.length; i++) {
      // for(let k = 0; k < this.deptSpecRoles.length; k++) {
      //   if(departments[i])
      // }
      this.deptSpecRoles.map((dep: any) => {
        if (departments[i] === dep.depid) {
          this.roles = [...this.roles, ...dep.designations];
        }
      });
    }
  }

  async onRoleChange() {
    try {
      let { designations } = this.policyForm.value;
      console.log(designations);
      let isAnyRole = designations.includes('any');
      this.validateIsAnyRole(isAnyRole);
    } catch (error: any) {
      console.log(error);
    }
  }
  async onPolicySubmit() {
    try {
      console.log('Form submit');
      console.log(this.policyForm.value);
    } catch (error: any) {
      console.log(error);
    }
  }
}
