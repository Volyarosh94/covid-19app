import { Injectable } from "@nestjs/common";
import * as request from "request";
import getRegion from "./getRegion";
import { GoogleLocations } from "../contract/googleLocations";


@Injectable()
export class GoogleAutocompleteParseDataMappers{

    async getPlacesIds(places: Promise<GoogleLocations[]>){
        const placesResult: GoogleLocations[] = await places;
        const ids = [];
        placesResult.forEach(res => {
            ids.push(res.place_id);
        });

        let dataOfPlaces = [];
        for(let i = 0; i < ids.length; i++){
            let dataOfPlace = await this.getDataOfPlaces(ids[i]);
            dataOfPlaces.push(dataOfPlace);
        }

        return dataOfPlaces;
    }

    async getDataOfPlaces(id: string){
        return new Promise((resolve, reject) => {
            request.get(
                `https://maps.googleapis.com/maps/api/place/details/json?placeid=${id}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
                (err, _,
                    buffer
                ) => {
                    if (err) {
                        reject(err);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    resolve(JSON.parse(buffer.toString()).result.address_components);
                }
            );
        });
    }



    getParseData(arr){
        let parsedAddresses = [];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        arr.forEach(el => {
            let parsedObj = {};
            let middlewareObj = {};
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            el.forEach(o => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                o["types"].forEach( type =>{
                    if(type == "country"){
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        middlewareObj["region"] = getRegion[0][o.short_name];
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        middlewareObj[type] = o.long_name;
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    middlewareObj[type] = o.long_name;
                });
                parsedObj = { ...middlewareObj };
            });
            parsedAddresses.push(parsedObj);
        });
        return parsedAddresses;
    }
}
