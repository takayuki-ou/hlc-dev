@restResource(urlMapping='/Accounts/*/contacts')
global with sharing class AccountManager {
    @httpGet
    global static Account getAccount() {
        String accountId = RestContext.request.requestURI.substringBetween('/Accounts/', '/contacts');
        Account account = [SELECT Id, Name, (SELECT Id, Name FROM Contacts) FROM Account WHERE Id = :accountId];
        return account;
    }
}