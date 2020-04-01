const herokyProxy =                         "https://cors-anywhere.herokuapp.com/"

const googleMapsApi =                       "https://maps.googleapis.com/maps/api/"
export const googleMapsApiKey =             "AIzaSyDmiLt1q8awr7GMnNXCl735acjvPCBSnYY"
export const googleMapsSignature =          "BZ3kIYZcrtB4x2assUb80o51-FQ="

const darkSkyApiKey =                       "8511656b91c747162608fe0ee99ef6c8/"

export const xRapidapiHost =                "hotels4.p.rapidapi.com"
export const xRapidapiKey =                 "kKPFS8TqJomsht6zykkCIpC9nhAcp1Ki8wejsn9pKbpLw3mD1L"

export const currencyConvertApiKey =        "6804eaca83571bf62c73"


export const URL_GOOGLE_MAPS =              "https://maps.google.com/maps?"
export const URL_GOOGLE_MAPS_GEOCODE =      `${googleMapsApi}geocode/json?key=${googleMapsApiKey}&language=en`
export const URL_GOOGLE_MAPS_LIBRARIES =    `${googleMapsApi}js?v=3.exp&key=${googleMapsApiKey}&language=en&libraries=places,geometry`

// DOCS: https://developers.google.com/places/web-service/search#PlaceSearchRequests
export const URL_GOOGLE_NEARBY_SEARCH =     `${herokyProxy}${googleMapsApi}place/nearbysearch/json?key=${googleMapsApiKey}&language=en&`

// DOCS: https://developers.google.com/places/web-service/photos
export const URL_GOOGLE_PHOTOS =            `${herokyProxy}${googleMapsApi}place/photo?key=${googleMapsApiKey}&`

export const URL_DARKSKY_DATA =             `${herokyProxy}https://api.darksky.net/forecast/${darkSkyApiKey}`

export const URL_COUNTRY_WARNING_DATA =     `${herokyProxy}https://reisewarnung.net/api?country=`

export const URL_CURRENCY_CONVERT_DATA =    `https://free.currconv.com/api/v7/convert`

export const API_URL =                      'http://localhost:4000'


// CAR RENTALS API ENDPOINTS => DOCS: https://developer.avis.com/docs/car-availability
export const URL_VEHICLES_AUTH =            "https://stage.abgapiservices.com/oauth/token/v1"
export const URL_VEHICLES =                 "https://stage.abgapiservices.com/cars/catalog/v1/vehicles"
export const URL_VEHICLES_CLIENT_ID =       "98168f71a8e3482e939396a45d9d69b1"
export const URL_VEHICLES_CLIENT_SECRET =   "7365a510fa114D0886510324e8b3d412"


// HOTEL API ENDPOINTS => DOCS: https://rapidapi.com/apidojo/api/hotels4?endpoint=apiendpoint_a14f03e0-f8b8-4930-9266-c618363f10e6
const urlHotelsPrefix =                     `https://hotels4.p.rapidapi.com/properties/`
export const URL_HOTELS_LIST =              `${urlHotelsPrefix}list`
export const URL_HOTEL_DETAILS =            `${urlHotelsPrefix}get-details`
export const URL_HOTEL_PHOTOS =             `${urlHotelsPrefix}get-hotel-photos`




// HOTEL API ENDPOINTS => DOCS: https://developers.amadeus.com/self-service/category/hotel/api-doc/hotel-search/api-reference
/*export const URL_HOTELS_AUTH =            `${herokyProxy}https://test.api.amadeus.com/v1/security/oauth2/token`
export const URL_HOTELS =                   `${herokyProxy}https://test.api.amadeus.com/v2/shopping/hotel-offers`
export const URL_HOTELS_CLIENT_ID =         "6DJnvweFMgSd7Rud3QrDKQbt2C05dYZF"
export const URL_HOTELS_CLIENT_SECRET =     "fHpgkbB6AVsNaa64"*/