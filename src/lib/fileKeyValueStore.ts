/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

import * as _ from 'lodash';
import { Global } from './global';

const _set = (aliases, group, alias, property) => {
    if (_.isNil(aliases[group])) {
        aliases[group] = {};
    }

    if (_.isUndefined(property)) {
        delete aliases[group][alias];
    } else {
        const value = _.entries(aliases[group]).find((val) => val[1] === property);

        if (value) {
            delete aliases[group][value[0]];
        }

        aliases[group][alias] = property;
    }
    return aliases;
};

/**
 * Manages access to a key value store in the global .sfdx folder under <fileStoreName>.
 *
 * All key value pairs are stored under a group.
 *
 */
export class KeyValueStore {

    private fileStoreName;

    constructor(fileName: string) {
        this.fileStoreName = fileName;
    }

    /**
     * Set a group of aliases in a bulk save.
     * @param {array} keyAndValues An object representing the aliases to set.
     * @param {string} group The group the alias belongs to.
     * @returns {Promise<object>} The new aliases that were saved.
     */
    public async updateValues(newAliases: any, group: string= 'default'): Promise<any> {
        const aliases = await Global.fetchConfigInfo(this.fileStoreName);
        _.forEach(newAliases, (val, key) => _set(aliases, group, key, val));
        await Global.saveConfigInfo(this.fileStoreName, aliases);
        return newAliases;
    }

    /**
     * Delete an alias from a group
     * @param {string} alias The name of the alias to delete
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is deleted
     */
    public async remove(alias: string, group: string= 'default'): Promise<any> {
        return await this.update(alias, undefined, group);
    }

    /**
     * Set an alias on a group
     * @param {string} alias The name of the alias to set
     * @param {string} property The value of the alias
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is set
     */
    public async update(alias: string , property: string | number, group: string= 'default'): Promise<any> {
        const aliases = await Global.fetchConfigInfo(this.fileStoreName);
        _set(aliases, group, alias, property);
        await Global.saveConfigInfo(this.fileStoreName, aliases);
    }

    /**
     * Unset one or more aliases on a group
     * @param {string[]} aliases The names of the aliases to unset
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are unset
     */
    // Should this be renamed? 'Unlink'?
    public async unset(aliasesToUnset: string[], group: string= 'default'): Promise<any> {
        const aliases = await Global.fetchConfigInfo(this.fileStoreName);
        aliases[group] = _.omit(aliases[group], aliasesToUnset);
        await Global.saveConfigInfo(this.fileStoreName, aliases);
    }

    /**
     * Get an alias from a group
     * @param {string} alias The name of the alias to get
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    public async fetch(alias: string, group: string= 'default') {
        const aliases = await this.list(group);
        return aliases[alias];
    }

    /**
     * Get all alias from a group
     * @param {string} group The group of aliases to retrieve. Defaults to Orgs
     * @returns {Promise} The promise resolved when the aliases are retrieved
     */
    public async list(group: string= 'default'): Promise<any> {
        const aliases = await Global.fetchConfigInfo(this.fileStoreName);
        return aliases[group] || {};
    }

    /**
     * Get an alias from a group by value
     * @param {string} value The value of the alias to match
     * @param {string} group The group the alias belongs to. Defaults to Orgs
     * @returns {Promise} The promise resolved when the alias is retrieved
     */
    public async byValue(value: string | number, group: string= 'default'): Promise<any> {
        const aliases = await this.list(group);
        return Object.keys(aliases).find((key) => aliases[key] === value);
    }
}
