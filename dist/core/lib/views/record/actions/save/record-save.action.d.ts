import { ViewMode } from 'common';
import { RecordActionData, RecordActionHandler } from '../record.action';
import { MessageService } from '../../../../services/message/message.service';
import { ModuleNavigation } from '../../../../services/navigation/module-navigation/module-navigation.service';
import { NotificationStore } from '../../../../store/notification/notification.store';
import { RecentlyViewedService } from "../../../../services/navigation/recently-viewed/recently-viewed.service";
import { StateManager } from '../../../../store/state-manager';
import * as i0 from "@angular/core";
export declare class RecordSaveAction extends RecordActionHandler {
    protected message: MessageService;
    protected navigation: ModuleNavigation;
    protected notificationStore: NotificationStore;
    protected recentlyViewedService: RecentlyViewedService;
    protected stateManager: StateManager;
    key: string;
    modes: ViewMode[];
    constructor(message: MessageService, navigation: ModuleNavigation, notificationStore: NotificationStore, recentlyViewedService: RecentlyViewedService, stateManager: StateManager);
    run(data: RecordActionData): void;
    shouldDisplay(data: RecordActionData): boolean;
    /**
     * THIS IS A CUSTOM FUNCTION TO REFRESH THE RECORD
     * Refresh the record from the backend to update the field-layout component
     * @param data RecordActionData
     */
    protected refreshRecord(data: RecordActionData): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<RecordSaveAction, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<RecordSaveAction>;
}
