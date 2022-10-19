import { BookingEntity } from "../../booking-service/entity/booking.entity";
import { BookingConfirmationEmailParams } from "../contract/bookingConfirmationEmailParams";

export function sendBookingConfirmationEmailTemplate(
    { booking, denyToken, approveToken }: BookingConfirmationEmailParams,
    formatBookingDate: (booking: BookingEntity) => string
) {
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
                  >Approval required</span
                  >
              </td>
              </tr>
              <tr>
              <td>
                  <div
                  style="
                      padding: 14px 0px 21px;
                      border-bottom: 1px solid rgb(244, 244, 244);
                  "
                  >
                  <span style="color: rgb(94, 94, 94); font-size: 14px"
                      ><strong style="color: rgb(0, 0, 0)">${booking.desk.name}</strong> required
                      approval for user
                      <a
                      href="mailto:${booking.user.email}"
                      style="color: rgb(30, 31, 123); font-weight: 500"
                      >${booking.user.email}</a
                      >. <br />Please approve or deny</span
                  >
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
                  <table style="border-collapse: collapse; margin-top: 26px">
                  <tr>
                      <td>
                      <a
                          href="${process.env.WEBSITES_HOST}/booking-approval/approve?token=${denyToken}&deskName=${
    booking.desk.name
}"
                          style="
                          padding: 7px 46px;
                          background-color: rgb(255, 255, 255);
                          border: 1px solid rgba(13, 14, 76, 0.2);
                          color: rgb(30, 31, 123);
                          border-radius: 6px;
                          font-size: 14px;
                          font-weight: 600;
                          min-width: 130px;
                          text-align: center;
                          text-decoration: none;
                          "
                          >Deny</a
                      >
                      </td>
                      <td>
                      <div style="margin-left: 20px">
                          <a
                          href="${process.env.WEBSITES_HOST}/booking-approval/approve?token=${approveToken}&deskName=${
    booking.desk.name
}"
                          style="
                              padding: 7px 35px;
                              background-color: rgb(30, 31, 123);
                              color: rgb(255, 255, 255);
                              border-radius: 6px;
                              font-size: 14px;
                              font-weight: 600;
                              min-width: 130px;
                              text-align: center;
                              text-decoration: none;
                          "
                          >Approve</a
                          >
                      </div>
                      </td>
                  </tr>
                  </table>
              </td>
              </tr>
          </table>
          </div>
      </body>
      </html>       
  `;
}
