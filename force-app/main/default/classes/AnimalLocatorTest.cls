@isTest
public with sharing class AnimalLocatorTest {
    @isTest
    static void testGetAnimalNameById() {
        Test.setMock(HttpCalloutMock.class, new AnimalLocatorMock());
        String animalName = AnimalLocator.getAnimalNameById(1);
        System.assertEquals('chicken', animalName);
    }
}