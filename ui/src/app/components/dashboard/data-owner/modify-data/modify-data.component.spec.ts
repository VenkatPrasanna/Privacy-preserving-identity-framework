import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyDataComponent } from './modify-data.component';

describe('ModifyDataComponent', () => {
  let component: ModifyDataComponent;
  let fixture: ComponentFixture<ModifyDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
