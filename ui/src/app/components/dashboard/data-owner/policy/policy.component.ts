import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { OrganisationsManagementService } from 'src/app/services/organisations-management.service';
import { AlertsService } from 'src/app/services/alerts.service';
import { PolicyManagementService } from 'src/app/services/policy-management.service';

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
  roles: string[] = [];
  deptSpecRoles: any = [];
  filteredDepartments: any = [];
  filteredRoles: any = [];
  organisationAndDepartmentsStore: any = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<PolicyComponent>,
    private orgService: OrganisationsManagementService,
    private alertService: AlertsService,
    private policyService: PolicyManagementService
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
    // let otherdeps = JSON.parse(JSON.stringify(returnedDepartments));
    // this.filteredDepartments = JSON.parse(
    //   JSON.stringify([
    //     { depid: 'any', depname: 'any', isAllowed: true },
    //     ...otherdeps,
    //   ])
    // );
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
      //this.filteredRoles = [...this.filteredRoles, ...designations];
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
    this.filteredDepartments = [];
    this.filteredRoles = [];
    this.policyForm.controls['departments'].setValue([]);
    if (isAnyOrg) {
      this.filteredDepartments = [
        { depid: 'any', depname: 'any', isAllowed: true },
      ];
      this.policyForm.controls['organisations'].setValue(['any']);
      this.allDepartments.map((department: any) => {
        let found = this.filteredDepartments.find(
          (fdep: any) =>
            fdep.depname.toLowerCase() === department.depname.toLowerCase()
        );
        if (!found) {
          this.filteredDepartments.push(
            JSON.parse(JSON.stringify({ ...department }))
          );
        }
      });
      return;
    }

    if (organisations.length <= 0) {
      this.filteredDepartments = [];
      this.filteredRoles = [];
      return;
    }

    this.filteredDepartments = [
      { depid: 'any', depname: 'any', isAllowed: true },
    ];
    for (let i = 0; i < organisations.length; i++) {
      let returnedOrganisations =
        await this.orgService.organisationSpecificDepartments(organisations[i]);
      let { departmentids } = returnedOrganisations;
      // Maintain a store of organisations and department ids
      if (this.organisationAndDepartmentsStore.length <= 0) {
        this.organisationAndDepartmentsStore.push({
          ...returnedOrganisations,
        });
      } else {
        let found = this.organisationAndDepartmentsStore.find(
          (org: any) => org.orgid === organisations[i]
        );
        if (found) {
          found.departmentids = departmentids;
        } else {
          this.organisationAndDepartmentsStore.push({
            ...returnedOrganisations,
          });
        }
      }
      departmentids.map((depid: string) => {
        this.allDepartments.map((department: any) => {
          if (department.depid.toLowerCase() === depid.toLowerCase()) {
            let newdep = JSON.parse(JSON.stringify(department));
            newdep.depname =
              newdep.depname + ' - ' + returnedOrganisations.orgname;
            this.filteredDepartments.push(newdep);
          }
        });
      });
    }
  }

  async getOrganisationNames(ids: string[]) {
    let orgnames: string[] = [];
    ids.map((id: string) => {
      this.allOrganisations.map((org: any) => {
        if (org.orgid.toLowerCase() === id.toLowerCase()) {
          orgnames.push(org.orgname);
        }
      });
    });
    return orgnames;
  }

  async getDepartmentNames(ids: string[]) {
    let names: string[] = [];
    ids.map((id: string) => {
      this.allDepartments.map((department: any) => {
        if (department.depid.toLowerCase() === id.toLowerCase()) {
          names.push(department.depname);
        }
      });
    });
    return names;
  }

  async getDepartmentIds(names: string[]) {
    let ids: string[] = [];
    names.map((name: string) => {
      this.allDepartments.map((department: any) => {
        if (department.depname.toLowerCase() === name.toLowerCase()) {
          ids.push(department.depid);
        }
      });
    });
    return ids;
  }

  async onDepartmentChange() {
    let { organisations, departments } = this.policyForm.value;
    this.filteredRoles = [];
    let isAnyDept = departments.includes('any');
    let isAnyOrg = organisations.includes('any');
    this.validateIsAnyDepartment(isAnyDept);
    this.policyForm.controls['designations'].setValue([]);
    if (departments.length <= 0) {
      this.filteredRoles = [];
      return;
    }
    // Any organisation specific departments
    if (isAnyOrg) {
      if (!isAnyDept) {
        let selectedDepartmentNames: string[] = await this.getDepartmentNames(
          departments
        );
        let matchedDepartmentIds: string[] = await this.getDepartmentIds(
          selectedDepartmentNames
        );
        this.filteredRoles = [{ name: 'any', isAllowed: true }];
        for (let i = 0; i < matchedDepartmentIds.length; i++) {
          let returnedDepartment: any =
            await this.orgService.getDepartmentDetails(matchedDepartmentIds[i]);
          let { depname, designations } = returnedDepartment;
          designations.map((designation: string) => {
            this.filteredRoles.push(
              JSON.parse(
                JSON.stringify({
                  name: designation + ' - ' + depname,
                  isAllowed: true,
                })
              )
            );
          });
        }
        return;
      }
      if (isAnyDept) {
        this.policyForm.controls['departments'].setValue(['any']);
        this.filteredRoles = [{ name: 'any', isAllowed: true }];
        this.allRoles.map((role: any) => {
          let found = this.filteredRoles.find(
            (frole: any) => frole.name.toLowerCase() === role.name.toLowerCase()
          );
          if (!found) {
            this.filteredRoles.push(JSON.parse(JSON.stringify(role)));
          }
        });
        return;
      }
    }
    this.filteredRoles = [{ name: 'any', isAllowed: true }];

    // If organisation is selected
    if (!isAnyOrg) {
      if (isAnyDept) {
        this.policyForm.controls['departments'].setValue(['any']);
        let departmentIds: string[] = [];
        for (let i = 0; i < organisations.length; i++) {
          let found = this.organisationAndDepartmentsStore.find(
            (org: any) =>
              org.orgid.toLowerCase() === organisations[i].toLowerCase()
          );
          if (found) {
            let { departmentids } = found;
            departmentIds = JSON.parse(
              JSON.stringify([...departmentIds, ...departmentids])
            );
          }
        }
        this.filteredRoles = [{ name: 'any', isAllowed: true }];
        for (let i = 0; i < departmentIds.length; i++) {
          let returnedDepartment: any =
            await this.orgService.getDepartmentDetails(departmentIds[i]);
          let { depname, designations } = returnedDepartment;
          designations.map((designation: string) => {
            this.organisationAndDepartmentsStore.map((organisation: any) => {
              let found = organisation.departmentids.includes(departmentIds[i]);
              if (found) {
                let orgname = organisation.orgname;
                this.filteredRoles.push(
                  JSON.parse(
                    JSON.stringify({
                      name: designation + ' - ' + orgname,
                      isAllowed: true,
                    })
                  )
                );
              }
            });
          });
        }
        return;
      } else {
        this.filteredRoles = [{ name: 'any', isAllowed: true }];
        for (let i = 0; i < departments.length; i++) {
          let returnedDepartment: any =
            await this.orgService.getDepartmentDetails(departments[i]);
          let { depid, depname, designations } = returnedDepartment;
          designations.map((designation: string) => {
            this.organisationAndDepartmentsStore.map((organisation: any) => {
              let found = organisation.departmentids.includes(depid);
              if (found) {
                let orgname = organisation.orgname;
                this.filteredRoles.push(
                  JSON.parse(
                    JSON.stringify({
                      name: designation + ' - ' + orgname + ' - ' + depname,
                      isAllowed: true,
                    })
                  )
                );
              }
            });
          });
        }
        return;
      }
    }
  }

  async onRoleChange() {
    try {
      let { designations } = this.policyForm.value;
      let isAnyRole = designations.includes('any');
      this.validateIsAnyRole(isAnyRole);
      if (isAnyRole) {
        this.policyForm.controls['designations'].setValue(['any']);
        return;
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  async constructOrganisation(name: string) {
    let organisation: any = new Object();
    organisation['name'] = name;
    organisation['departments'] = [];
    return JSON.parse(JSON.stringify(organisation));
  }
  async constructDepartment(name: string) {
    let department: any = new Object();
    department['name'] = name;
    department['designations'] = [];
    return JSON.parse(JSON.stringify(department));
  }

  async policyConstruct(organisation: any) {
    try {
      let policy: any = new Object();
      policy['organisation'] = new Object();
      policy['organisation'] = { ...organisation };
      return policy;
    } catch (error) {
      console.log(error);
    }
  }

  async onPolicySubmit() {
    try {
      this.isLoading = true;
      let { dataid, organisations, departments, designations } =
        this.policyForm.value;
      if (
        !dataid ||
        organisations.length <= 0 ||
        departments.length <= 0 ||
        designations.length <= 0
      ) {
        return;
      }

      // Check is organisation is any
      let isAnyOrg = organisations.includes('any');
      let isAnyDept = departments.includes('any');
      let isAnyRole = designations.includes('any');

      let policies: any = [];

      if (isAnyOrg) {
        // Map selected departments
        let returnedOrganisation = await this.constructOrganisation('any');
        if (isAnyDept) {
          if (isAnyRole) {
            let returnedOrganisation = await this.constructOrganisation('any');
            let returnedDepartment = await this.constructDepartment('any');
            returnedDepartment['designations'] = ['any'];
            returnedOrganisation['departments'].push({ ...returnedDepartment });
            let returnedPolicy = await this.policyConstruct(
              returnedOrganisation
            );
            policies.push(returnedPolicy);
          } else {
            let returnedDepartment = await this.constructDepartment('any');

            let roles = JSON.parse(JSON.stringify(designations));
            returnedDepartment['designations'] = roles;
            returnedOrganisation['departments'].push({ ...returnedDepartment });
            let returnedPolicy = await this.policyConstruct(
              returnedOrganisation
            );
            policies.push(returnedPolicy);
          }
        } else {
          let departmentNames = await this.getDepartmentNames(departments);
          if (isAnyRole) {
            for (let i = 0; i < departmentNames.length; i++) {
              let returnedDepartment = await this.constructDepartment(
                departmentNames[i]
              );
              returnedDepartment['designations'] = ['any'];
              returnedOrganisation['departments'].push({
                ...returnedDepartment,
              });
            }
            let returnedPolicy = await this.policyConstruct(
              returnedOrganisation
            );
            policies.push(returnedPolicy);
          } else {
            for (let i = 0; i < departmentNames.length; i++) {
              let returnedDepartment = await this.constructDepartment(
                departmentNames[i]
              );
              let roles = designations.filter((role: string) =>
                role.split(' - ').includes(departmentNames[i])
              );
              roles = roles.map((role: string) => {
                return role.split(' - ')[0];
              });
              if (roles.length > 0) {
                returnedDepartment['designations'] = [...roles];
                returnedOrganisation['departments'].push({
                  ...returnedDepartment,
                });
              }
            }
            if (returnedOrganisation['departments'].length > 0) {
              let returnedPolicy = await this.policyConstruct(
                returnedOrganisation
              );
              policies.push(returnedPolicy);
            }
          }
        }
      } else {
        let organisationNames = await this.getOrganisationNames(organisations);
        if (isAnyDept) {
          if (isAnyRole) {
            for (let i = 0; i < organisationNames.length; i++) {
              let returnedOrganisation = await this.constructOrganisation(
                organisationNames[i]
              );
              let returnedDepartment = await this.constructDepartment('any');
              returnedDepartment['designations'] = ['any'];
              returnedOrganisation['departments'].push({
                ...returnedDepartment,
              });
              let returnedPolicy = await this.policyConstruct(
                returnedOrganisation
              );
              policies.push(returnedPolicy);
            }
          } else {
            for (let i = 0; i < organisationNames.length; i++) {
              let returnedOrganisation = await this.constructOrganisation(
                organisationNames[i]
              );
              let returnedDepartment = await this.constructDepartment('any');
              let roles = designations.filter((role: string) =>
                role.split(' - ').includes(organisationNames[i])
              );
              roles = roles.map((role: string) => {
                return role.split(' - ')[0];
              });
              if (roles.length > 0) {
                returnedDepartment['designations'] = [...roles];
                returnedOrganisation['departments'].push({
                  ...returnedDepartment,
                });
              }
              if (returnedOrganisation.departments.length > 0) {
                let returnedPolicy = await this.policyConstruct(
                  returnedOrganisation
                );
                policies.push(returnedPolicy);
              }
            }
          }
        } else {
          if (isAnyRole) {
            for (let i = 0; i < organisationNames.length; i++) {
              let matchedDepartments = await this.removeEmptyPolicies(
                organisations[i],
                departments
              );
              if (matchedDepartments && matchedDepartments.length > 0) {
                let returnedOrganisation = await this.constructOrganisation(
                  organisationNames[i]
                );
                let departmentNames = await this.getDepartmentNames(
                  matchedDepartments
                );
                for (let k = 0; k < departmentNames.length; k++) {
                  let returnedDepartment = await this.constructDepartment(
                    departmentNames[k]
                  );
                  returnedDepartment['designations'] = ['any'];
                  returnedOrganisation['departments'].push({
                    ...returnedDepartment,
                  });
                }
                if (returnedOrganisation.departments.length > 0) {
                  let returnedPolicy = await this.policyConstruct(
                    returnedOrganisation
                  );
                  policies.push(returnedPolicy);
                }
              }
            }
          } else {
            for (let i = 0; i < organisationNames.length; i++) {
              let matchedDepartments = await this.removeEmptyPolicies(
                organisations[i],
                departments
              );
              if (matchedDepartments && matchedDepartments.length > 0) {
                let returnedOrganisation = await this.constructOrganisation(
                  organisationNames[i]
                );
                let departmentNames = await this.getDepartmentNames(
                  matchedDepartments
                );
                for (let k = 0; k < departmentNames.length; k++) {
                  let returnedDepartment = await this.constructDepartment(
                    departmentNames[k]
                  );
                  let roles = designations.filter(
                    (role: string) =>
                      role.split(' - ').includes(departmentNames[k]) &&
                      role.split(' - ').includes(organisationNames[i])
                  );
                  roles = roles.map((role: string) => {
                    return role.split(' - ')[0];
                  });
                  if (roles.length > 0) {
                    returnedDepartment['designations'] = [...roles];
                    returnedOrganisation['departments'].push({
                      ...returnedDepartment,
                    });
                  }
                }
                if (returnedOrganisation.departments.length > 0) {
                  let returnedPolicy = await this.policyConstruct(
                    returnedOrganisation
                  );
                  policies.push(returnedPolicy);
                }
              }
            }
          }
        }
      }
      if (policies.length <= 0) {
        this.alertService.alertErrorMessage('Invalid policy settings');
        return;
      }
      let txnconfirmation = await this.policyService.setPolicy(
        dataid,
        JSON.stringify(policies)
      );
      if (txnconfirmation.confirmations === 1) {
        this.isLoading = false;
        this.alertService.alertSuccessMessage('Policy is added successfully');
      }
    } catch (error: any) {
      console.log(error);
      this.isLoading = false;
      this.alertService.alertErrorMessage('Failed to set a policy');
    }
  }

  async removeEmptyPolicies(organisation: string, departments: string[]) {
    try {
      let departmentids = this.organisationAndDepartmentsStore
        .filter(
          (org: any) => org.orgid.toLowerCase() === organisation.toLowerCase()
        )
        .map((org: any) => org.departmentids);
      departmentids = departmentids.flat();
      let matchedIds: string[] = departments.filter((department: string) =>
        departmentids.includes(department)
      );
      return matchedIds.length > 0 ? matchedIds : [];
    } catch (error) {
      console.log(error);
    }
  }
}
