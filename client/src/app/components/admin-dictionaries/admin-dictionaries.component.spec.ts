import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDictionariesComponent } from './admin-dictionaries.component';

describe('AdminDictionariesComponent', () => {
    let component: AdminDictionariesComponent;
    let fixture: ComponentFixture<AdminDictionariesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminDictionariesComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminDictionariesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
