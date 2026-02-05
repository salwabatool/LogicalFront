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
import { StateManager } from '../../../../store/state-manager';
import * as i0 from "@angular/core";
import * as i1 from "../../../../services/message/message.service";
import * as i2 from "../../../../services/navigation/module-navigation/module-navigation.service";
import * as i3 from "../../../../store/state-manager";
class RecordSaveNewAction extends RecordActionHandler {
    constructor(message, navigation, stateManager) {
        super();
        this.message = message;
        this.navigation = navigation;
        this.stateManager = stateManager;
        this.key = 'saveNew';
        this.modes = ['create'];
    }
    run(data) {
        data.store.recordStore.validate().pipe(take(1)).subscribe(valid => {
            if (valid) {
                data.store.save().pipe(take(1)).subscribe({
                    next: (record) => {
                        // Check if record is null or invalid (which indicates an error)
                        if (!record || !record.id) {
                            this.stateManager.showErrorMessage(true);
                            // Don't navigate away - preserve form data
                            return;
                        }
                        // Only navigate if save was successful
                        const store = data.store;
                        const params = store.params;
                        const moduleName = store.getModuleName();
                        this.navigation.navigateBack(record, moduleName, params);
                    },
                    error: (error) => {
                        // Show error message via signal for Opportunities
                        if (data.store.getModuleName() === 'opportunities') {
                            this.stateManager.showErrorMessage(true);
                        }
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
    static { this.ɵfac = function RecordSaveNewAction_Factory(t) { return new (t || RecordSaveNewAction)(i0.ɵɵinject(i1.MessageService), i0.ɵɵinject(i2.ModuleNavigation), i0.ɵɵinject(i3.StateManager)); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: RecordSaveNewAction, factory: RecordSaveNewAction.ɵfac, providedIn: 'root' }); }
}
export { RecordSaveNewAction };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(RecordSaveNewAction, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: i1.MessageService }, { type: i2.ModuleNavigation }, { type: i3.StateManager }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjb3JkLXNhdmUtbmV3LmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL2NvcmUvYXBwL2NvcmUvc3JjL2xpYi92aWV3cy9yZWNvcmQvYWN0aW9ucy9zYXZlLW5ldy9yZWNvcmQtc2F2ZS1uZXcuYWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNwQyxPQUFPLEVBQW1CLG1CQUFtQixFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDdkUsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLDhDQUE4QyxDQUFDO0FBQzVFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLDZFQUE2RSxDQUFDO0FBQzdHLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQzs7Ozs7QUFFN0QsTUFHYSxtQkFBb0IsU0FBUSxtQkFBbUI7SUFLeEQsWUFDYyxPQUF1QixFQUN2QixVQUE0QixFQUM1QixZQUEwQjtRQUVwQyxLQUFLLEVBQUUsQ0FBQztRQUpFLFlBQU8sR0FBUCxPQUFPLENBQWdCO1FBQ3ZCLGVBQVUsR0FBVixVQUFVLENBQWtCO1FBQzVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1FBTnhDLFFBQUcsR0FBRyxTQUFTLENBQUM7UUFDaEIsVUFBSyxHQUFHLENBQUMsUUFBb0IsQ0FBQyxDQUFDO0lBUS9CLENBQUM7SUFFRCxHQUFHLENBQUMsSUFBc0I7UUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5RCxJQUFJLEtBQUssRUFBRTtnQkFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7b0JBQ3RDLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUNiLGdFQUFnRTt3QkFDaEUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7NEJBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ3pDLDJDQUEyQzs0QkFDM0MsT0FBTzt5QkFDVjt3QkFFRCx1Q0FBdUM7d0JBQ3ZDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQ3pCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7d0JBQzVCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDN0QsQ0FBQztvQkFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTt3QkFDYixrREFBa0Q7d0JBQ2xELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxlQUFlLEVBQUU7NEJBQ2hELElBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzVDO29CQUNMLENBQUM7aUJBQ0osQ0FBQyxDQUFDO2dCQUNILE9BQU87YUFDVjtZQUVELElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBc0I7UUFDaEMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztvRkEvQ1EsbUJBQW1CO3VFQUFuQixtQkFBbUIsV0FBbkIsbUJBQW1CLG1CQUZoQixNQUFNOztTQUVULG1CQUFtQjt1RkFBbkIsbUJBQW1CO2NBSC9CLFVBQVU7ZUFBQztnQkFDUixVQUFVLEVBQUUsTUFBTTthQUNyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU3VpdGVDUk0gaXMgYSBjdXN0b21lciByZWxhdGlvbnNoaXAgbWFuYWdlbWVudCBwcm9ncmFtIGRldmVsb3BlZCBieSBTYWxlc0FnaWxpdHkgTHRkLlxuICogQ29weXJpZ2h0IChDKSAyMDIxIFNhbGVzQWdpbGl0eSBMdGQuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXJcbiAqIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhcyBwdWJsaXNoZWQgYnkgdGhlXG4gKiBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24gd2l0aCB0aGUgYWRkaXRpb24gb2YgdGhlIGZvbGxvd2luZyBwZXJtaXNzaW9uIGFkZGVkXG4gKiB0byBTZWN0aW9uIDE1IGFzIHBlcm1pdHRlZCBpbiBTZWN0aW9uIDcoYSk6IEZPUiBBTlkgUEFSVCBPRiBUSEUgQ09WRVJFRCBXT1JLXG4gKiBJTiBXSElDSCBUSEUgQ09QWVJJR0hUIElTIE9XTkVEIEJZIFNBTEVTQUdJTElUWSwgU0FMRVNBR0lMSVRZIERJU0NMQUlNUyBUSEVcbiAqIFdBUlJBTlRZIE9GIE5PTiBJTkZSSU5HRU1FTlQgT0YgVEhJUkQgUEFSVFkgUklHSFRTLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVFxuICogQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1NcbiAqIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmVcbiAqIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBJbiBhY2NvcmRhbmNlIHdpdGggU2VjdGlvbiA3KGIpIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIHZlcnNpb24gMywgdGhlc2UgQXBwcm9wcmlhdGUgTGVnYWwgTm90aWNlcyBtdXN0IHJldGFpbiB0aGUgZGlzcGxheSBvZiB0aGVcbiAqIFwiU3VwZXJjaGFyZ2VkIGJ5IFN1aXRlQ1JNXCIgbG9nby4gSWYgdGhlIGRpc3BsYXkgb2YgdGhlIGxvZ29zIGlzIG5vdCByZWFzb25hYmx5XG4gKiBmZWFzaWJsZSBmb3IgdGVjaG5pY2FsIHJlYXNvbnMsIHRoZSBBcHByb3ByaWF0ZSBMZWdhbCBOb3RpY2VzIG11c3QgZGlzcGxheVxuICogdGhlIHdvcmRzIFwiU3VwZXJjaGFyZ2VkIGJ5IFN1aXRlQ1JNXCIuXG4gKi9cblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Vmlld01vZGV9IGZyb20gJ2NvbW1vbic7XG5pbXBvcnQge3Rha2V9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7UmVjb3JkQWN0aW9uRGF0YSwgUmVjb3JkQWN0aW9uSGFuZGxlcn0gZnJvbSAnLi4vcmVjb3JkLmFjdGlvbic7XG5pbXBvcnQge01lc3NhZ2VTZXJ2aWNlfSBmcm9tICcuLi8uLi8uLi8uLi9zZXJ2aWNlcy9tZXNzYWdlL21lc3NhZ2Uuc2VydmljZSc7XG5pbXBvcnQge01vZHVsZU5hdmlnYXRpb259IGZyb20gJy4uLy4uLy4uLy4uL3NlcnZpY2VzL25hdmlnYXRpb24vbW9kdWxlLW5hdmlnYXRpb24vbW9kdWxlLW5hdmlnYXRpb24uc2VydmljZSc7XG5pbXBvcnQge1N0YXRlTWFuYWdlcn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RvcmUvc3RhdGUtbWFuYWdlcic7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUmVjb3JkU2F2ZU5ld0FjdGlvbiBleHRlbmRzIFJlY29yZEFjdGlvbkhhbmRsZXIge1xuXG4gICAga2V5ID0gJ3NhdmVOZXcnO1xuICAgIG1vZGVzID0gWydjcmVhdGUnIGFzIFZpZXdNb2RlXTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcm90ZWN0ZWQgbWVzc2FnZTogTWVzc2FnZVNlcnZpY2UsXG4gICAgICAgIHByb3RlY3RlZCBuYXZpZ2F0aW9uOiBNb2R1bGVOYXZpZ2F0aW9uLFxuICAgICAgICBwcm90ZWN0ZWQgc3RhdGVNYW5hZ2VyOiBTdGF0ZU1hbmFnZXIsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgcnVuKGRhdGE6IFJlY29yZEFjdGlvbkRhdGEpOiB2b2lkIHtcbiAgICAgICAgZGF0YS5zdG9yZS5yZWNvcmRTdG9yZS52YWxpZGF0ZSgpLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKHZhbGlkID0+IHtcbiAgICAgICAgICAgIGlmICh2YWxpZCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3RvcmUuc2F2ZSgpLnBpcGUodGFrZSgxKSkuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgcmVjb3JkIGlzIG51bGwgb3IgaW52YWxpZCAod2hpY2ggaW5kaWNhdGVzIGFuIGVycm9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWNvcmQgfHwgIXJlY29yZC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVNYW5hZ2VyLnNob3dFcnJvck1lc3NhZ2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgbmF2aWdhdGUgYXdheSAtIHByZXNlcnZlIGZvcm0gZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT25seSBuYXZpZ2F0ZSBpZiBzYXZlIHdhcyBzdWNjZXNzZnVsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdG9yZSA9IGRhdGEuc3RvcmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJhbXMgPSBzdG9yZS5wYXJhbXM7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gc3RvcmUuZ2V0TW9kdWxlTmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0aW9uLm5hdmlnYXRlQmFjayhyZWNvcmQsIG1vZHVsZU5hbWUsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNob3cgZXJyb3IgbWVzc2FnZSB2aWEgc2lnbmFsIGZvciBPcHBvcnR1bml0aWVzXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5zdG9yZS5nZXRNb2R1bGVOYW1lKCkgPT09ICdvcHBvcnR1bml0aWVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGVNYW5hZ2VyLnNob3dFcnJvck1lc3NhZ2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubWVzc2FnZS5hZGRXYXJuaW5nTWVzc2FnZUJ5S2V5KCdMQkxfVkFMSURBVElPTl9FUlJPUlMnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvdWxkRGlzcGxheShkYXRhOiBSZWNvcmRBY3Rpb25EYXRhKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiJdfQ==