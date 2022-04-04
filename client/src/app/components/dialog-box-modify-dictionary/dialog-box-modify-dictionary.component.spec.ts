import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogBoxModifyDictionaryComponent } from './dialog-box-modify-dictionary.component';

describe('DialogBoxModifyDictionaryComponent', () => {
  let component: DialogBoxModifyDictionaryComponent;
  let fixture: ComponentFixture<DialogBoxModifyDictionaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogBoxModifyDictionaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogBoxModifyDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
