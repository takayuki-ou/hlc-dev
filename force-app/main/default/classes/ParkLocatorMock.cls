public with sharing class ParkLocatorMock implements WebServiceMock{
    public void doInvoke(
        Object stub,
        Object request,
        Map<String, Object> response,
        String endpoint,
        String soapAction,
        String requestName,
        String responseNS,
        String responseName,
        String responseType
    ) {
        ParkService.byCountryResponse response_x = new ParkService.byCountryResponse();
        response_x.return_x = new String[]{'Yellowstone', 'Grand Canyon', 'Yosemite'};
        response.put('response_x', response_x);
    }
}