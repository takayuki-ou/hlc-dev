public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactsBornAfter(Date birthDate) {
        return [SELECT Id, Name, Email FROM Contact WHERE BirthDate > :birthDate];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts(){
        throw new AuraHandledException('Error');
    }
}