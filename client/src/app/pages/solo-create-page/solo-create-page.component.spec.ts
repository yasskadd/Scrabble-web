import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoloCreatePageComponent } from './solo-create-page.component';

describe('SoloCreatePageComponent', () => {
  let component: SoloCreatePageComponent;
  let fixture: ComponentFixture<SoloCreatePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoloCreatePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoloCreatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
