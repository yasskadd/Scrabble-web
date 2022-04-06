import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHighScoresComponent } from './admin-high-scores.component';

describe('AdminHighScoresComponent', () => {
  let component: AdminHighScoresComponent;
  let fixture: ComponentFixture<AdminHighScoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminHighScoresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHighScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
