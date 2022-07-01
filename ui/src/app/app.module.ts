import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './material/material.module';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { UserComponent } from './components/user/user.component';
import { UsernotfoundComponent } from './components/usernotfound/usernotfound.component';
import { DataOwnerComponent } from './components/dashboard/data-owner/data-owner.component';
import { DataRequesterComponent } from './components/dashboard/data-requester/data-requester.component';
import { SuperAdminComponent } from './components/dashboard/super-admin/super-admin.component';
import { SidenavComponent } from './components/dashboard/sidenav/sidenav.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ModifyDataComponent } from './components/dashboard/data-owner/modify-data/modify-data.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    UserComponent,
    UsernotfoundComponent,
    DataOwnerComponent,
    DataRequesterComponent,
    SuperAdminComponent,
    SidenavComponent,
    DashboardComponent,
    ModifyDataComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
