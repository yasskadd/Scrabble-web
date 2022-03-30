import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminVirtualPlayersComponent } from './admin-virtual-players.component';

describe('AdminVirtualPlayersComponent', () => {
    let component: AdminVirtualPlayersComponent;
    let fixture: ComponentFixture<AdminVirtualPlayersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminVirtualPlayersComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminVirtualPlayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
