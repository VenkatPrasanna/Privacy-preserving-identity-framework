import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { FormGroup, Validators, FormControl } from "@angular/forms";
import { GenericService } from "src/app/services/generic.service";
import { UserManagementService } from "src/app/services/user-management.service";
import { AlertsService } from "src/app/services/alerts.service";
import { OrganisationsManagementService } from "src/app/services/organisations-management.service";

export interface UserRequests {
  userAddress: string;
  userType: Number;
  approved: boolean;
}

@Component({
  selector: "app-super-admin",
  templateUrl: "./super-admin.component.html",
  styleUrls: ["./super-admin.component.css"],
})
export class SuperAdminComponent implements OnInit {
  isLoading: boolean = false;
  isAttributeLoading: boolean = false;
  displayedColumns: string[] = ["address", "type", "status", "actions"];
  dataSource: any;
  superAdmin: string;
  isProfile: boolean = true;
  isRequests: boolean = false;
  isRevoke: boolean = false;
  categoryForm: FormGroup;
  userWaitingForApproval: any = {
    userType: 0,
  };

  @ViewChild(MatTable) table: MatTable<UserRequests>;

  constructor(
    private genericService: GenericService,
    private usersService: UserManagementService,
    private alertService: AlertsService,
    private orgService: OrganisationsManagementService
  ) {}

  ngOnInit(): void {
    this.getSuperAdmin();
    this.categoryForm = new FormGroup({
      category: new FormControl("", Validators.required),
    });
  }

  resetForm() {
    this.categoryForm.reset();
  }

  updateView(section: string) {
    if (section === "profile") {
      this.isProfile = true;
      this.isRevoke = false;
      this.isRequests = false;
    } else if (section === "requests") {
      this.isProfile = false;
      this.isRevoke = false;
      this.isRequests = true;
      if (!this.dataSource) {
        this.getUserApprovalRequests();
      }
    } else if (section === "revoke") {
      this.isProfile = false;
      this.isRequests = false;
      this.isRevoke = true;
    }
  }

  async getSuperAdmin() {
    this.superAdmin = await this.genericService.getConnectedUser();
  }

  async getUserApprovalRequests() {
    try {
      this.isLoading = true;
      let datasets = await this.usersService.getUserApprovalRequests();
      this.dataSource = new MatTableDataSource(datasets);
      this.isLoading = false;
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  }

  async getUserDetails(element: UserRequests) {
    try {
      this.isAttributeLoading = true;
      let returnedAttributes = await this.usersService.getUserDetails(element);
      this.userWaitingForApproval = {
        ...returnedAttributes,
        userType: element.userType,
      };
      this.isAttributeLoading = false;
    } catch (error) {
      console.log(error);
      this.isAttributeLoading = false;
    }
  }

  async findOrganisation(orgname: string) {
    try {
      let returnedOrganisations = await this.orgService.getAllOrganisations();
      let isOrgPresent = returnedOrganisations.find(
        (org: any) => org.orgname.toLowerCase() === orgname.toLowerCase()
      );
      return isOrgPresent;
    } catch (error) {
      console.log(error);
    }
  }

  async findAndAddOrganisation(user: any) {
    // Get all orgs, validate is org present, get org departments, inlcueds designations
    let isOrgPresent = await this.findOrganisation(user.organisation);
    let alldesignations = await this.orgService.getAllDesignations();
    let isToAddDesignation = alldesignations.includes(user.designation);
    let organisation = this.genericService.stringToBytes(
      user.organisation.toLowerCase()
    );
    let department = this.genericService.stringToBytes(
      user.department.toLowerCase()
    );
    let designation = this.genericService.stringToBytes(
      user.designation.toLowerCase()
    );
    if (isOrgPresent) {
      // Organisation is present so get departments of ths=is organisation and validate for the department presence
      let returnedOrganisation =
        await this.orgService.organisationSpecificDepartments(
          isOrgPresent.orgid
        );
      let { departmentids } = returnedOrganisation;

      let returnedDepartments: any = [];
      for (let i = 0; i < departmentids.length; i++) {
        let department = await this.orgService.getDepartmentDetails(
          departmentids[i]
        );
        returnedDepartments.push(department);
      }
      let isDepFound = returnedDepartments.find(
        (department: any) =>
          department.depname.toLowerCase() === user.department.toLowerCase()
      );
      if (isDepFound) {
        let roleaddconfirmation =
          await this.orgService.addDesignationToDepartment(
            isDepFound.depid,
            designation,
            !isToAddDesignation
          );
        if (roleaddconfirmation.confirmations === 1) {
          this.alertService.alertSuccessMessage(
            "Organisations updated successfully"
          );
        }
      } else {
        let depaddconfirmation = await this.orgService.addDeptToOrganisation(
          isOrgPresent.orgid,
          department,
          designation,
          !isToAddDesignation
        );
        if (depaddconfirmation.confirmations === 1) {
          this.alertService.alertSuccessMessage(
            "Organisations updated successfully"
          );
        }
      }
    } else {
      let orgaddconfirmation = await this.orgService.createOrganisation(
        organisation,
        department,
        designation,
        !isToAddDesignation
      );
      if (orgaddconfirmation.confirmations === 1) {
        this.alertService.alertSuccessMessage(
          "Organisations updated successfully"
        );
      }
    }
  }

  async addCategory() {
    try {
      this.isLoading = true;
      let { category } = this.categoryForm.value;
      if (!category) {
        return;
      }
      category = this.genericService.stringToBytes(category.toLowerCase());
      let txnconfirmation = await this.usersService.addCategory(category);
      if (txnconfirmation.confirmations === 1) {
        this.isLoading = false;
        this.resetForm();
        this.alertService.alertSuccessMessage("Category added successfully");
      }
    } catch (error) {
      console.log(error);
      this.isLoading = false;
      this.resetForm();
      this.alertService.alertErrorMessage(
        "Soemthing went wrong. Please try after sometime."
      );
    }
  }

  async approveUser(user: any) {
    try {
      console.log(user);
      this.isAttributeLoading = true;
      if (user.userType === 2) {
        await this.findAndAddOrganisation(user);
      }

      let txnconfirmation = await this.usersService.approveUser(user);
      if (txnconfirmation.confirmations === 1) {
        this.isAttributeLoading = false;
        this.userWaitingForApproval = JSON.parse(
          JSON.stringify({ userType: 0 })
        );
        this.getUserApprovalRequests();
        this.alertService.alertSuccessMessage("User approved successfully");
      }
    } catch (error) {
      console.log(error);
      this.isAttributeLoading = false;
    }
  }

  cancelApproval() {
    this.userWaitingForApproval = JSON.parse(JSON.stringify({ userType: 0 }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
