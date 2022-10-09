/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St, Clutter, GLib } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;


const Calendar = imports.ui.calendar;


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));
        
        this._calendarSource = new Calendar.DBusEventSource();
        
        
        this._menuLayout = new St.BoxLayout({
            vertical: false,
            clip_to_allocation: true,
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            reactive: true,
            x_expand: true,
            pack_start: false
        });

        
        const icon = new St.Icon({
            icon_name: 'alarm-symbolic',
            style_class: 'system-status-icon'
        });
        const text = new St.Label({
            text: "Hello world!",
            style_class: "system-status-text",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });

        this._menuLayout.add_actor(icon);
        this._menuLayout.add_actor(text);



        this.add_actor(this._menuLayout);




        

        let item = new PopupMenu.PopupMenuItem(_('Show Notification'));
        item.connect('activate', () => {
            Main.notify(_('Whatʼs up, folks?'));
        });
        this.menu.addMenuItem(item);
    }



    checkCalendarEvents() {

        const src = this._calendarSource;
        src._loadEvents(true);

        const today = new Date();
        const next10Days = new Date();

        today.setHours(0); // get event from today at midnight
        next10Days.setDate(today.getDate() + 10);
        const events = src.getEvents(today, next10Days);

        events.forEach(event => {
            log("Event ID:", event.id);
            log("Summary:", event.summary);
            log("Starting at", event.date);
            log("Ending at", event.end);
            log("");
        });

    }

});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);


        this.sourceId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            1,                               // seconds to wait
            () => {
                this._indicator.checkCalendarEvents();
                return GLib.SOURCE_CONTINUE;
            }
        );

        
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;

        GLib.Source.remove(this.sourceId);
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

