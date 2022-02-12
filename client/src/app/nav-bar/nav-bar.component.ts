import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent {
    @Input()
    isDarkMode = false;

    @Output()
    readonly darkModeSwitched = new EventEmitter<boolean>();

    onDarkModeSwitched({ checked }: MatSlideToggleChange) {
        this.darkModeSwitched.emit(checked);
    }
}
