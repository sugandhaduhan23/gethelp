export const cityInfoFromZip = {
   results : [
       {
         address_components : [
             {
               long_name : '94588',
               short_name : '94588',
               types : [ 'postal_code' ]
             },
             {
               long_name : 'Pleasanton',
               short_name : 'Pleasanton',
               types : [ 'locality', 'political' ]
             },
             {
               long_name : 'Alameda County',
               short_name : 'Alameda County',
               types : [ 'administrative_area_level_2', 'political' ]
             },
             {
               long_name : 'California',
               short_name : 'CA',
               types : [ 'administrative_area_level_1', 'political' ]
             },
             {
               long_name : 'United States',
               short_name : 'US',
               types : [ 'country', 'political' ]
             }
          ],
          formatted_address : 'Pleasanton, CA 94588, USA',
          geometry : {
            bounds : {
               northeast : {
                  lat : 37.702088,
                  lng : -121.8213661
                },
                southwest : {
                  lat : 37.632432,
                  lng : -121.979341
                }
             },
             location : {
               lat : 37.6873908,
               lng : -121.9131761
             },
             location_type : 'APPROXIMATE',
             viewport : {
               northeast : {
                  lat : 37.702088,
                  lng : -121.8213661
                },
                southwest : {
                  lat : 37.632432,
                  lng : -121.979341
                }
             }
          },
          place_id : 'ChIJhz_eheXrj4ARCvNe3h_0dig',
          postcode_localities : [ 'Asco', 'Hayward', 'Pleasanton', 'Sunol' ],
          types : [ 'postal_code' ]
       }
    ],
    status : 'OK'
 }
 