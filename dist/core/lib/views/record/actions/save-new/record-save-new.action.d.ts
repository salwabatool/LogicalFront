import { ViewMode } from 'common';
import { RecordActionData, RecordActionHandler } from '../record.action';
import { MessageService } from '../../../../services/message/message.service';
import { ModuleNavigation } from '../../../../services/navigation/module-navigation/module-navigation.service';
import { StateManager } from '../../../../store/state-manager';
import * as i0 from "@angular/core";
export declare class RecordSaveNewAction extends RecordActionHandler {
    protected message: MessageService;
    protected navigation: ModuleNavigation;
    protected stateManager: StateManager;
    key: string;
    modes: ViewMode[];
    constructor(message: MessageService, navigation: ModuleNavigation, stateManager: StateManager);
    run(data: RecordActionData): void;
    shouldDisplay(data: RecordActionData): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<RecordSaveNewAction, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<RecordSaveNewAction>;
}
