@isTest
public with sharing class AccountManagerTest {
    @isTest
    static void testGetAccount() {
        RestRequest request = new RestRequest();
        Id accountId = createTestAccount();
        request.requestURI = '/Accounts/' + accountId + '/contacts';
        request.httpMethod = 'GET';
        RestContext.request = request;
        Account account = AccountManager.getAccount();
        Assert.areEqual('Test Account', account.Name);
        Assert.areEqual(2, account.Contacts.size());
        
    }

    private static Id createTestAccount() {
        Account account = new Account(Name = 'Test Account');
        insert account;
        Contact contact1 = new Contact(AccountId = account.Id, FirstName = 'Test', LastName = 'Contact');
        insert contact1;
        Contact contact2 = new Contact(AccountId = account.Id, FirstName = 'Test2', LastName = 'Contact2');
        insert contact2;
        return account.Id;
    }
}