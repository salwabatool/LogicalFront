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

import {Injectable} from '@angular/core';
import {ViewMode} from 'common';
import {take, tap} from 'rxjs/operators';
import {RecordActionData, RecordActionHandler} from '../record.action';
import {MessageService} from '../../../../services/message/message.service';
import {ModuleNavigation} from '../../../../services/navigation/module-navigation/module-navigation.service';
import {NotificationStore} from '../../../../store/notification/notification.store';
import {RecentlyViewedService} from "../../../../services/navigation/recently-viewed/recently-viewed.service";
import {StateManager} from '../../../../store/state-manager';

@Injectable({
    providedIn: 'root'
})
export class RecordSaveAction extends RecordActionHandler {

    key = 'save';
    modes = ['edit' as ViewMode];

    constructor(
        protected message: MessageService,
        protected navigation: ModuleNavigation,
        protected notificationStore: NotificationStore,
        protected recentlyViewedService: RecentlyViewedService,
        protected stateManager: StateManager,
    ) {
        super();
    }

    run(data: RecordActionData): void {
        const isFieldLoading = Object.keys(data.store.recordStore.getStaging().fields).some(fieldKey => {
            const field = data.store.recordStore.getStaging().fields[fieldKey];
            return field.loading ?? false;
        });

        if(isFieldLoading) {
            this.message.addWarningMessageByKey('LBL_LOADING_IN_PROGRESS');
            return ;
        }

        data.store.recordStore.validate().pipe(take(1)).subscribe(valid => {
            if (valid) {
                data.store.save().pipe(
                    take(1),
                ).subscribe({
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

    shouldDisplay(data: RecordActionData): boolean {
        return true;
    }

    /**
     * THIS IS A CUSTOM FUNCTION TO REFRESH THE RECORD
     * Refresh the record from the backend to update the field-layout component
     * @param data RecordActionData
     */
    protected refreshRecord(data: RecordActionData): void {
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
}
