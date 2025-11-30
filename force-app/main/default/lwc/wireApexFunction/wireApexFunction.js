import { LightningElement, api, wire } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';
import getContactsBornAfter from '@salesforce/apex/ContactController.getContactsBornAfter';

export default class WireApexFunction extends LightningElement {
    @api miniBirthDate;

    @wire(getContactsBornAfter, { birthDate: '$miniBirthDate' })
    contacts;

    // wired propertyのエラー処理
    get errors() {
        return (this.contacts.error) ?
            reduceErrors(this.contacts.error) : [];
    }

    // wired functionのエラー処理
    @wire(getContactsBornAfter, { birthDate: '$miniBirthDate' })
    wiredContacts({ data, error }) {
        if (data) {
            // execute something for data
            console.log(data);
        } else if (error) {
            this.errors = reduceErrors(error);
        }
    }
    
    // 命令的Apexコールのエラー処理
    errorsImperative;
    handleButtonClick() {
        getContactsBornAfter({ birthDate: this.miniBirthDate })
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                this.errorsImperative = reduceErrors(error);
            });
    }
}