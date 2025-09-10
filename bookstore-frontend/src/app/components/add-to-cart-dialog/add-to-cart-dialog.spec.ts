import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCartDialog } from './add-to-cart-dialog';

describe('AddToCartDialog', () => {
  let component: AddToCartDialog;
  let fixture: ComponentFixture<AddToCartDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToCartDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddToCartDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
