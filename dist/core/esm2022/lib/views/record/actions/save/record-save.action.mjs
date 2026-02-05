/**
 * SuiteCRM is a customer relationship management program developed by SalesAgility Ltd.
 * Copyright (C) 2021 SalesAgility Ltd.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation with the addition of the following permission added
 * to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED WORK
 * IN WHICH THE COPYRIGHT IS OWNED BY SALESAGILITY, SALESAGILITY DISCLAIMS THE
 * WARRANTY OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License
 * version 3, these Appropriate Legal Notices must retain the display of the
 * "Supercharged by SuiteCRM" logo. If the display of the logos is not reasonably
 * feasible for technical reasons, the Appropriate Legal Notices must display
 * the words "Supercharged by SuiteCRM".
 */
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { RecordActionHandler } from '../record.action';
import { MessageService } from '../../../../services/message/message.service';
import { ModuleNavigation } from '../../../../services/navigation/module-navigation/module-navigation.service';
import { NotificationStore } from '../../../../store/notification/notification.store';
import { RecentlyViewedService } from "../../../../services/navigation/recently-viewed/recently-viewed.service";
import { StateManager } from '../../../../store/state-manager';
import * as i0 from "@angular/core";
import * as i1 from "../../../../services/message/message.service";
import * as i2 from "../../../../services/navigation/module-navigation/module-navigation.service";
import * as i3 from "../../../../store/notification/notification.store";
import * as i4 from "../../../../services/navigation/recently-viewed/recently-viewed.service";
import * as i5 from "../../../../store/state-manager";
class RecordSaveAction extends RecordActionHandler {
    constructor(message, navigation, notificationStore, recentlyViewedService, stateManager) {
        super();
        this.message = message;
        this.navigation = navigation;
        this.notificationStore = notificationStore;
        this.recentlyViewedService = recentlyViewedService;
        this.stateManager = stateManager;
        this.key = 'save';
        this.modes = ['edit'];
    }
    run(data) {
        const isFieldLoading = Object.keys(data.store.recordStore.getStaging().fields).some(fieldKey => {
            const field = data.store.recordStore.getStaging().fields[fieldKey];
            return field.loading ?? false;
        });
        if (isFieldLoading) {
            this.message.addWarningMessageByKey('LBL_LOADING_IN_PROGRESS');
            return;
        }
        data.store.recordStore.validate().pipe(take(1)).subscribe(valid => {
            if (valid) {
                data.store.save().pipe(take(1)).subscribe({
                    next: (record) => {
                        // Check if record is null or invalid (which indicates an error)
                        if (data.store.getModuleName() === 'opportunities') {
                            if (!record || !record.id) {
                                this.stateManager.showErrorMessage(true);
                                this.refreshRecord(data);
                                return;
                            }
                        }
                        const params = data.store.params;
                        const moduleName = data.store.getModuleName();
                        const id = record.id;
                        this.notificationStore.conditionalNotificationRefresh('edit');
                        const recentlyViewed = this.recentlyViewedService.buildRecentlyViewed(moduleName, id);
                        this.recentlyViewedService.addRecentlyViewed(moduleName, recentlyViewed);
                        this.navigateBack(this.navigation, params, id, moduleName, record);
                    },
                    error: (error) => {
                        // Refresh the record to reload field-layout component
                        this.refreshRecord(data);
                    }
                });
                return;
            }
            this.message.addWarningMessageByKey('LBL_VALIDATION_ERRORS');
        });
    }
    shouldDisplay(data) {
        return true;
    }
    /**
     * THIS IS A CUSTOM FUNCTION TO REFRESH THE RECORD
     * Refresh the record from the backend to update the field-layout component
     * @param data RecordActionData
     */
    refreshRecord(data) {
        const moduleName = data.store.getModuleName();
        const recordId = data.store.recordStore.getBaseRecord()?.id;
        if (!recordId) {
            // console.warn('⚠️ [Save Action] No record ID found, cannot refresh');
            return;
        }
        // console.log('🔄 [Save Action] Refreshing record from backend...', { moduleName, recordId });
        // Reload the record from backend (useCache = false forces fresh fetch)
        data.store.recordStore.retrieveRecord(moduleName, recordId, false).pipe(take(1)).subscribe({
            next: (record) => {
                // console.log('✅ [Save Action] Record refreshed successfully');
                // The record store will automatically update, which will trigger field-layout to refresh
                // since it's subscribed to the dataSource observables
            },
            error: (error) => {
                // console.error('❌ [Save Action] Failed to refresh record:', error);
            }
        });
    }
    static { this.ɵfac = function RecordSaveAction_Factory(t) { return new (t || RecordSaveAction)(i0.ɵɵinject(i1.MessageService), i0.ɵɵinject(i2.ModuleNavigation), i0.ɵɵinject(i3.NotificationStore), i0.ɵɵinject(i4.RecentlyViewedService), i0.ɵɵinject(i5.StateManager)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: RecordSaveAction, factory: RecordSaveAction.ɵfac, providedIn: 'root' }); }
}
export { RecordSaveAction };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordSaveAction, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: i1.MessageService }, { type: i2.ModuleNavigation }, { type: i3.NotificationStore }, { type: i4.RecentlyViewedService }, { type: i5.StateManager }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkLXNhdmUuYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vY29yZS9hcHAvY29yZS9zcmMvbGliL3ZpZXdzL3JlY29yZC9hY3Rpb25zL3NhdmUvcmVjb3JkLXNhdmUuYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxJQUFJLEVBQU0sTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQW1CLG1CQUFtQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDdkUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBQzVFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDZFQUE2RSxDQUFDO0FBQzdHLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLG1EQUFtRCxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLHlFQUF5RSxDQUFDO0FBQzlHLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7OztBQUU3RCxNQUdhLGdCQUFpQixTQUFRLG1CQUFtQjtJQUtyRCxZQUNjLE9BQXVCLEVBQ3ZCLFVBQTRCLEVBQzVCLGlCQUFvQyxFQUNwQyxxQkFBNEMsRUFDNUMsWUFBMEI7UUFFcEMsS0FBSyxFQUFFLENBQUM7UUFORSxZQUFPLEdBQVAsT0FBTyxDQUFnQjtRQUN2QixlQUFVLEdBQVYsVUFBVSxDQUFrQjtRQUM1QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBQ3BDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsaUJBQVksR0FBWixZQUFZLENBQWM7UUFSeEMsUUFBRyxHQUFHLE1BQU0sQ0FBQztRQUNiLFVBQUssR0FBRyxDQUFDLE1BQWtCLENBQUMs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QUUsQ0FBQztRQUU1RCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsdUVBQXVFO1lBQ3ZFLE9BQU87U0FDVjtRQUVELCtGQUErRjtRQUUvRix1RUFBdUU7UUFDdkUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN2RixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDYixnRUFBZ0U7Z0JBQ2hFLHlGQUF5RjtnQkFDekYsc0RBQXNEO1lBQzFELENBQUM7WUFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDYixxRUFBcUU7WUFDekUsQ0FBQztTQUNKLENBQUMsQ0FBQztJQUNQLENBQUM7aUZBNUZRLGdCQUFnQjt1RUFBaEIsZ0JBQWdCLFdBQWhCLGdCQUFnQixtQkFGYixNQUFNOztTQUVULGdCQUFnQjt1RkFBaEIsZ0JBQWdCO2NBSDVCLFVBQVU7ZUFBQztnQkFDUixVQUFVLEVBQUUsTUFBTTthQUNyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU3VpdGVDUk0gaXMgYSBjdXN0b21lciByZWxhdGlvbnNoaXAgbWFuYWdlbWVudCBwcm9ncmFtIGRldmVsb3BlZCBieSBTYWxlc0FnaWxpdHkgTHRkLlxuICogQ29weXJpZ2h0IChDKSAyMDIxIFNhbGVzQWdpbGl0eSBMdGQuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXJcbiAqIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhcyBwdWJsaXNoZWQgYnkgdGhlXG4gKiBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24gd2l0aCB0aGUgYWRkaXRpb24gb2YgdGhlIGZvbGxvd2luZyBwZXJtaXNzaW9uIGFkZGVkXG4gKiB0byBTZWN0aW9uIDE1IGFzIHBlcm1pdHRlZCBpbiBTZWN0aW9uIDcoYSk6IEZPUiBBTlkgUEFSVCBPRiBUSEUgQ09WRVJFRCBXT1JLXG4gKiBJTiBXSElDSCBUSEUgQ09QWVJJR0hUIElTIE9XTkVEIEJZIFNBTEVTQUdJTElUWSwgU0FMRVNBR0lMSVRZIERJU0NMQUlNUyBUSEVcbiAqIFdBUlJBTlRZIE9GIE5PTiBJTkZSSU5HRU1FTlQgT0YgVEhJUkQgUEFSVFkgUklHSFRTLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVFxuICogQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1NcbiAqIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmVcbiAqIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBJbiBhY2NvcmRhbmNlIHdpdGggU2VjdGlvbiA3KGIpIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIHZlcnNpb24gMywgdGhlc2UgQXBwcm9wcmlhdGUgTGVnYWwgTm90aWNlcyBtdXN0IHJldGFpbiB0aGUgZGlzcGxheSBvZiB0aGVcbiAqIFwiU3VwZXJjaGFyZ2VkIGJ5IFN1aXRlQ1JNXCIgbG9nby4gSWYgdGhlIGRpc3BsYXkgb2YgdGhlIGxvZ29zIGlzIG5vdCByZWFzb25hYmx5XG4gKiBmZWFzaWJsZSBmb3IgdGVjaG5pY2FsIHJlYXNvbnMsIHRoZSBBcHByb3ByaWF0ZSBMZWdhbCBOb3RpY2VzIG11c3QgZGlzcGxheVxuICogdGhlIHdvcmRzIFwiU3VwZXJjaGFyZ2VkIGJ5IFN1aXRlQ1JNXCIuXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Vmlld01vZGV9IGZyb20gJ2NvbW1vbic7XG5pbXBvcnQge3Rha2UsIHRhcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHtSZWNvcmRBY3Rpb25EYXRhLCBSZWNvcmRBY3Rpb25IYW5kbGVyfSBmcm9tICcuLi9yZWNvcmQuYWN0aW9uJztcbmltcG9ydCB7TWVzc2FnZVNlcnZpY2V9IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL21lc3NhZ2UvbWVzc2FnZS5zZXJ2aWNlJztcbmltcG9ydCB7TW9kdWxlTmF2aWdhdGlvbn0gZnJvbSAnLi4vLi4vLi4vLi4vc2VydmljZXMvbmF2aWdhdGlvbi9tb2R1bGUtbmF2aWdhdGlvbi9tb2R1bGUtbmF2aWdhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7Tm90aWZpY2F0aW9uU3RvcmV9IGZyb20gJy4uLy4uLy4uLy4uL3N0b3JlL25vdGlmaWNhdGlvbi9ub3RpZmljYXRpb24uc3RvcmUnO1xuaW1wb3J0IHtSZWNlbnRseVZpZXdlZFNlcnZpY2V9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXJ2aWNlcy9uYXZpZ2F0aW9uL3JlY2VudGx5LXZpZXdlZC9yZWNlbnRseS12aWV3ZWQuc2VydmljZVwiO1xuaW1wb3J0IHtTdGF0ZU1hbmFnZXJ9IGZyb20gJy4uLy4uLy4uLy4uL3N0b3JlL3N0YXRlLW1hbmFnZXInO1xuXG5ASW5qZWN0YWJsZSh7XG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnXG59KVxuZXhwb3J0IGNsYXNzIFJlY29yZFNhdmVBY3Rpb24gZXh0ZW5kcyBSZWNvcmRBY3Rpb25IYW5kbGVyIHtcblxuICAgIGtleSA9ICdzYXZlJztcbiAgICBtb2RlcyA9IFsnZWRpdCcgYXMgVmlld01vZGVdO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByb3RlY3RlZCBtZXNzYWdlOiBNZXNzYWdlU2VydmljZSxcbiAgICAgICAgcHJvdGVjdGVkIG5hdmlnYXRpb246IE1vZHVsZU5hdmlnYXRpb24sXG4gICAgICAgIHByb3RlY3RlZCBub3RpZmljYXRpb25TdG9yZTogTm90aWZpY2F0aW9uU3RvcmUsXG4gICAgICAgIHByb3RlY3RlZCByZWNlbnRseVZpZXdlZFNlcnZpY2U6IFJlY2VudGx5Vmlld2VkU2VydmljZSxcbiAgICAgICAgcHJvdGVjdGVkIHN0YXRlTWFuYWdlcjogU3RhdGVNYW5hZ2VyLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJ1bihkYXRhOiBSZWNvcmRBY3Rpb25EYXRhKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGlzRmllbGRMb2FkaW5nID0gT2JqZWN0LmtleXMoZGF0YS5zdG9yZS5yZWNvcmRTdG9yZS5nZXRTdGFnaW5nKCkuZmllbGRzKS5zb21lKGZpZWxkS2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gZGF0YS5zdG9yZS5yZWNvcmRTdG9yZS5nZXRTdGFnaW5nKCkuZmllbGRzW2ZpZWxkS2V5XTtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZC5sb2FkaW5nID8/IGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZihpc0ZpZWxkTG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdlLmFkZFdhcm5pbmdNZXNzYWdlQnlLZXkoJ0xCTF9MT0FESU5HX0lOX1BST0dSRVNTJyk7XG4gICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS5zdG9yZS5yZWNvcmRTdG9yZS52YWxpZGF0ZSgpLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKHZhbGlkID0+IHtcbiAgICAgICAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3RvcmUuc2F2ZSgpLnBpcGUoXG4gICAgICAgICAgICAgICAgICAgIHRha2UoMSksXG4gICAgICAgICAgICAgICAgKS5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgICBuZXh0OiAocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiByZWNvcmQgaXMgbnVsbCBvciBpbnZhbGlkICh3aGljaCBpbmRpY2F0ZXMgYW4gZXJyb3IpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdG9yZS5nZXRNb2R1bGVOYW1lKCkgPT09ICdvcHBvcnR1bml0aWVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVjb3JkIHx8ICFyZWNvcmQuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZU1hbmFnZXIuc2hvd0Vycm9yTWVzc2FnZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUmVjb3JkKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBkYXRhLnN0b3JlLnBhcmFtcztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBkYXRhLnN0b3JlLmdldE1vZHVsZU5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gcmVjb3JkLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdG9yZS5jb25kaXRpb25hbE5vdGlmaWNhdGlvblJlZnJlc2goJ2VkaXQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY2VudGx5Vmlld2VkID0gdGhpcy5yZWNlbnRseVZpZXdlZFNlcnZpY2UuYnVpbGRSZWNlbnRseVZpZXdlZChtb2R1bGVOYW1lLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2VudGx5Vmlld2VkU2VydmljZS5hZGRSZWNlbnRseVZpZXdlZChtb2R1bGVOYW1lLCByZWNlbnRseVZpZXdlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlQmFjayh0aGlzLm5hdmlnYXRpb24sIHBhcmFtcywgaWQsIG1vZHVsZU5hbWUsIHJlY29yZCk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZnJlc2ggdGhlIHJlY29yZCB0byByZWxvYWQgZmllbGQtbGF5b3V0IGNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoUmVjb3JkKGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UuYWRkV2FybmluZ01lc3NhZ2VCeUtleSgnTEJMX1ZBTElEQVRJT05fRVJST1JTJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3VsZERpc3BsYXkoZGF0YTogUmVjb3JkQWN0aW9uRGF0YSk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUSElTIElTIEEgQ1VTVE9NIEZVTkNUSU9OIFRPIFJFRlJFU0ggVEhFIFJFQ09SRFxuICAgICAqIFJlZnJlc2ggdGhlIHJlY29yZCBmcm9tIHRoZSBiYWNrZW5kIHRvIHVwZGF0ZSB0aGUgZmllbGQtbGF5b3V0IGNvbXBvbmVudFxuICAgICAqIEBwYXJhbSBkYXRhIFJlY29yZEFjdGlvbkRhdGFcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVmcmVzaFJlY29yZChkYXRhOiBSZWNvcmRBY3Rpb25EYXRhKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBkYXRhLnN0b3JlLmdldE1vZHVsZU5hbWUoKTtcbiAgICAgICAgY29uc3QgcmVjb3JkSWQgPSBkYXRhLnN0b3JlLnJlY29yZFN0b3JlLmdldEJhc2VSZWNvcmQoKT8uaWQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXJlY29yZElkKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLndhcm4oJ+KaoO+4jyBbU2F2ZSBBY3Rpb25dIE5vIHJlY29yZCBJRCBmb3VuZCwgY2Fubm90IHJlZnJlc2gnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ/CflIQgW1NhdmUgQWN0aW9uXSBSZWZyZXNoaW5nIHJlY29yZCBmcm9tIGJhY2tlbmQuLi4nLCB7IG1vZHVsZU5hbWUsIHJlY29yZElkIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gUmVsb2FkIHRoZSByZWNvcmQgZnJvbSBiYWNrZW5kICh1c2VDYWNoZSA9IGZhbHNlIGZvcmNlcyBmcmVzaCBmZXRjaClcbiAgICAgICAgZGF0YS5zdG9yZS5yZWNvcmRTdG9yZS5yZXRyaWV2ZVJlY29yZChtb2R1bGVOYW1lLCByZWNvcmRJZCwgZmFsc2UpLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgIG5leHQ6IChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygn4pyFIFtTYXZlIEFjdGlvbl0gUmVjb3JkIHJlZnJlc2hlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcmVjb3JkIHN0b3JlIHdpbGwgYXV0b21hdGljYWxseSB1cGRhdGUsIHdoaWNoIHdpbGwgdHJpZ2dlciBmaWVsZC1sYXlvdXQgdG8gcmVmcmVzaFxuICAgICAgICAgICAgICAgIC8vIHNpbmNlIGl0J3Mgc3Vic2NyaWJlZCB0byB0aGUgZGF0YVNvdXJjZSBvYnNlcnZhYmxlc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmVycm9yKCfinYwgW1NhdmUgQWN0aW9uXSBGYWlsZWQgdG8gcmVmcmVzaCByZWNvcmQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=