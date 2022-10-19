import { DeskApproverConfirmationEmailParams } from "../contract/deskApproverConfirmationEmailParams";

export function sendDeskApproverConfirmationEmailTemplate({ desk, email, token }: DeskApproverConfirmationEmailParams) {
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
              >Email confirmation</span
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
                ><strong style="color: rgb(0, 0, 0)">${desk.name}</strong> 
                <a
                  href="mailto:${email}"
                  style="color: rgb(30, 31, 123); font-weight: 500"
                  >${email}</a
                >. <br />Please confirm your email</span
              >
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <table style="border-collapse: collapse; margin-top: 26px">
              <tr>
                <td>
                <div style="margin-left: 20px">
                  <a
                      href="${process.env.WEBSITES_HOST}/api/desks/confirmApproverEmail?token=${token}"
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
                      >Confirm</a
                  >
                  </div>
                </td>
                <td></td>
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
