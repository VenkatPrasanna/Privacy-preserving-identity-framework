import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor(private snackbar: MatSnackBar) {}

  snackbarConfig: MatSnackBarConfig = {
    horizontalPosition: 'center',
    verticalPosition: 'top',
    duration: 4000,
  };

  alertErrorMessage(message: string) {
    this.snackbarConfig.panelClass = ['snackbar-danger'];
    this.snackbar.open(message, '', this.snackbarConfig);
  }

  alertSuccessMessage(message: string) {
    this.snackbarConfig.panelClass = ['snackbar-success'];
    this.snackbar.open(message, '', this.snackbarConfig);
  }
}
