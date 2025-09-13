import { LightningElement, wire } from 'lwc';
import getTopAccounts from '@salesforce/apex/AccountController.getTopAccounts';

const COLUMNS = [
    { label: 'ID', fieldName: 'Id' },
    { label: '名前', fieldName: 'Name' }
];

export default class AccountTable extends LightningElement {
    columns = COLUMNS;
    accounts;
    error;

    @wire(getTopAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.accounts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accounts = undefined;
        }
    }
}