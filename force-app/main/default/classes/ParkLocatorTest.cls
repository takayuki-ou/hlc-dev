@isTest
public with sharing class ParkLocatorTest {
    @isTest
    static void testParkLocator() {
        Test.setMock(WebServiceMock.class, new ParkServiceMock());
        String[] parks = ParkLocator.country('United States');
        Assert.areEqual(3, parks.size());
    }
}