public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getTopAccounts() {
        throw new AuraHandledException('This is a test exception');
        // return [
        //     SELECT Id, Name
        //     FROM Account
        //     ORDER BY CreatedDate DESC
        //     LIMIT 10
        // ];
    }
}