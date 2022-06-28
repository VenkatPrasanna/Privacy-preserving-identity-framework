import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataOwnerComponent } from './components/dashboard/data-owner/data-owner.component';
import { DataRequesterComponent } from './components/dashboard/data-requester/data-requester.component';
import { SuperAdminComponent } from './components/dashboard/super-admin/super-admin.component';
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/user/user.component';
import { UsernotfoundComponent } from './components/usernotfound/usernotfound.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'user', component: UserComponent },
  { path: 'connect', component: UsernotfoundComponent },
  { path: 'data-owner', component: DataOwnerComponent },
  { path: 'data-requester', component: DataRequesterComponent },
  { path: 'admin', component: SuperAdminComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
