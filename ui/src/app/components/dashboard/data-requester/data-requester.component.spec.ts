import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequesterComponent } from './data-requester.component';

describe('DataRequesterComponent', () => {
  let component: DataRequesterComponent;
  let fixture: ComponentFixture<DataRequesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataRequesterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRequesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
