import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGameHelpComponent } from './dialog-game-help.component';

describe('DialogGameHelpComponent', () => {
  let component: DialogGameHelpComponent;
  let fixture: ComponentFixture<DialogGameHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogGameHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogGameHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
