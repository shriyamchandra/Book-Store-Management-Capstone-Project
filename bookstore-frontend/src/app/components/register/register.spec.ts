import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register'; // Corrected import

describe('RegisterComponent', () => { // Corrected description
  let component: RegisterComponent; // Corrected type
  let fixture: ComponentFixture<RegisterComponent>; // Corrected type

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent] // Corrected import
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent); // Corrected component
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});