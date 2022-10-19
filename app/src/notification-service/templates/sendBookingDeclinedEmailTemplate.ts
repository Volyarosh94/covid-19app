import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { BookingEmailParams } from "../contract/bookingEmailParams";

export function sendBookingDeclinedEmailTemplate(
    { booking }: BookingEmailParams,
    formatBookingDate: (booking: BookingEntity) => string
): string {
    return `
  <html>
      <head>
          <link href="https://fonts.gstatic.com" rel="preconnect" />
          <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&amp;display=swap"
          rel="stylesheet"
          />
      </head>
      <body style="font-family: Poppins, sans-serif">
          <div style="max-width: 500px; margin: 0px auto; padding: 20px">
          <table style="border-collapse: collapse">
              <tr>
              <td>
                  <span style="font-size: 18px; font-weight: 600"
                  >Hello ${booking.user.name}</span
                  >
              </td>
              </tr>
              <tr>
              <td>
                  <div
                  style="
                      padding: 34px 0px 9px;
                      border-bottom: 1px solid rgb(244, 244, 244);
                  "
                  >
                  <table>
                      <tr>
                      <td>
                          <img
                          alt="appointment"
                          src="https://ipg-frontend.zazmicdemo.com/static/media/appointment.f321812c.png"
                          style="height: 44px"
                          />
                      </td>
                      <td>
                          <div style="margin-left: 11px">
                          <span style="font-weight: 600"
                              >Your appointment is declined</span
                          >
                          </div>
                      </td>
                      </tr>
                  </table>
                  </div>
              </td>
              </tr>
              <tr>
              <td>
                  <div style="margin-top: 20px">
                  <span style="font-size: 18px; font-weight: 600">Details</span
                  ><br />
                  <table style="border-collapse: collapse; margin-top: 10px">
                      <tr>
                      <td valign="top">
                          <span
                          style="
                              color: rgb(94, 94, 94);
                              font-size: 14px;
                              white-space: nowrap;
                          "
                          ><span
                              style="
                              padding: 4px 9px;
                              border-radius: 8px;
                              background-color: rgb(244, 244, 244);
                              "
                              ><img
                              alt="floor"
                              src="https://ipg-frontend.zazmicdemo.com/static/media/floor.11b2870e.png"
                              style="position: relative; top: 4px; height: 17px"
                              />
                              ${booking.desk.floor.floorName}</span
                          ></span
                          >
                      </td>
                      <td>
                          <div style="margin-left: 7px">
                          <span style="color: rgb(94, 94, 94); font-size: 14px"
                              ><img
                              alt="location"
                              src="https://ipg-frontend.zazmicdemo.com/static/media/location.c68ba8fc.png"
                              style="position: relative; top: 4px; height: 17px"
                              />
                              ${booking.location.locationAddress} ${booking.location.locationName}
                              <!-- Flatiron Building, 175 5th Ave, New York, NY 10010,
                              United States -->
                              </span>
                          </div>
                      </td>
                      </tr>
                  </table>
                  <div style="margin-top: 9px; font-size: 14px; font-weight: 600">
                      ${formatBookingDate(booking)}
                      <!-- Mar 5, 9am-12pm -->
                  </div>
                  </div>
              </td>
              </tr>
              <tr>
              <td>
                  <div style="margin-top: 21px">
                  <span
                      style="
                      padding: 2px 8px;
                      border-radius: 8px;
                      background-color: rgb(255, 76, 14);
                      font-size: 14px;
                      color: rgb(255, 255, 255);
                      "
                      >Mask is required</span
                  >
                  </div>
              </td>
              </tr>
          </table>
          </div>
      </body>
      </html>   
  `;
}
