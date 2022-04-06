import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VirtualPlayersService } from '@app/services/virtual-players.service';
import { of } from 'rxjs';
import { AdminVirtualPlayersComponent } from './admin-virtual-players.component';

const BOT_EXPERT_LIST = [
    {
        username: 'Paul',
        difficulty: 'Expert',
    },
    {
        username: 'MARC',
        difficulty: 'Expert',
    },
    {
        username: 'Luc',
        difficulty: 'Expert',
    },
    {
        username: 'Jean',
        difficulty: 'Expert',
    },
    {
        username: 'Charles',
        difficulty: 'Expert',
    },
];

const BOT_BEGINNER_LIST = [
    {
        username: 'Paul',
        difficulty: 'debutant',
    },
    {
        username: 'MARC',
        difficulty: 'debutant',
    },
    {
        username: 'Luc',
        difficulty: 'debutant',
    },
    {
        username: 'Jean',
        difficulty: 'debutant',
    },
    {
        username: 'Jules',
        difficulty: 'debutant',
    },
];

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({ action: true }),
        };
    }
}

describe('AdminVirtualPlayersComponent', () => {
    let component: AdminVirtualPlayersComponent;
    let fixture: ComponentFixture<AdminVirtualPlayersComponent>;
    let virtualPlayersServiceSpy: jasmine.SpyObj<VirtualPlayersService>;

    beforeEach(async () => {
        virtualPlayersServiceSpy = jasmine.createSpyObj(
            'VirtualPlayersService',
            ['getBotNames', 'addBotName', 'replaceBotName', 'deleteBotName', 'resetBotNames'],
            {
                expertBotNames: BOT_EXPERT_LIST,
            },
        );

        await TestBed.configureTestingModule({
            declarations: [AdminVirtualPlayersComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: VirtualPlayersService, useValue: virtualPlayersServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
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

    it('isUniqueName() should return false if the name of the new bot already exist ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        expect(component.isUniqueName('Jean')).toBeFalsy();
        expect(component.isUniqueName('Jules')).toBeFalsy();
    });

    it('isUniqueName() should return true if the name of the new bot does not already exist ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        expect(component.isUniqueName('Ludovique')).toBeTruthy();
    });

    it('addExpertName() should call updateBotList and virtualPlayer.addBotname if the name does not already exit ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.expertInput = 'Marcelliee';
        component.addExpertName();
        expect(virtualPlayersServiceSpy.addBotName).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addExpertName() should not call virtualPlayer.addBotname if the name does already exit ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.expertInput = 'Paul';
        component.addExpertName();
        expect(virtualPlayersServiceSpy.addBotName).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addBeginnerName() should call updateBotList and virtualPlayer.addBotname if the name does not already exit ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.beginnerInput = 'Marcelliee';
        component.addBeginnerName();
        expect(virtualPlayersServiceSpy.addBotName).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('addBeginnerName() should  not call updateBotList and virtualPlayer.addBotname if the name does already exit ', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.beginnerInput = 'Paul';
        component.addBeginnerName();
        expect(virtualPlayersServiceSpy.addBotName).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('should open a dialog box if the openReplaceNameDialog method is called', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        // eslint-disable-next-line dot-notation
        const dialogSpy = spyOn(component['dialog'], 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<typeof component>);
        component.openReplaceNameDialog('vincent', 'debutant');
        expect(dialogSpy).toHaveBeenCalled();
    });

    it('replaceBotName should not call updateBotList and  virtualPlayerService.replaceBotName if the newName is undefined', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.replaceBotName('vinc', '', 'debutant');
        expect(virtualPlayersServiceSpy.replaceBotName).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('replaceBotName should not call virtualPlayerService.replaceBotName if the currentName is a default name', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        component.replaceBotName('paul', 'lore', 'debutant');
        expect(virtualPlayersServiceSpy.replaceBotName).not.toHaveBeenCalled();
    });

    it('replaceBotName should not call virtualPlayerService.replaceBotName if the currentName is a name', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        component.replaceBotName('MARC', 'MARC', 'debutant');
        expect(virtualPlayersServiceSpy.replaceBotName).not.toHaveBeenCalled();
    });

    it('replaceBotName should call updateBotList and  virtualPlayerService.replaceBotName if the newName is  not undefined', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.replaceBotName('vinc', 'lore', 'debutant');
        expect(virtualPlayersServiceSpy.replaceBotName).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteBot should call updateBotList() and virtualPlayerService.deleteBotName if the name is not from the default list', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.deleteBot('vinc', 'debutant');
        expect(virtualPlayersServiceSpy.deleteBotName).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('deleteBot should  not call virtualPlayerService.deleteBotName if the name is from the default list', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        const spy = spyOn(component, 'updateBotList');
        component.deleteBot('paul', 'debutant');
        expect(virtualPlayersServiceSpy.deleteBotName).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it('resetBot should  call virtualPlayerService.resetBotName if the list of bot names contains more than the default one', () => {
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST;
        component.resetBot();
        expect(virtualPlayersServiceSpy.resetBotNames).toHaveBeenCalled();
    });

    it('resetBot should not call virtualPlayerService.resetBotName if the list of bot names does not contains more than the default one', () => {
        const BOT_BEGINNER_LIST_3 = [
            {
                username: 'Paul',
                difficulty: 'debutant',
            },
            {
                username: 'MARC',
                difficulty: 'debutant',
            },
            {
                username: 'Luc',
                difficulty: 'debutant',
            },
        ];
        virtualPlayersServiceSpy.beginnerBotNames = BOT_BEGINNER_LIST_3;
        component.resetBot();
        expect(virtualPlayersServiceSpy.resetBotNames).not.toHaveBeenCalled();
    });
});
