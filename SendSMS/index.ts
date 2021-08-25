import { DefaultAzureCredential } from "@azure/identity";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { SmsClient } from "@azure/communication-sms";

const fromPhoneNumber = process.env.FROM_PHONE_NUMBER;
const endpoint = process.env.COMM_SERVICE_ENDPOINT;

const credential = new DefaultAzureCredential();
const client = new SmsClient(endpoint, credential);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const sendResults = await client.send(
        {
            from: fromPhoneNumber,
            to: req.body.to,
            message: req.body.message
        },
        {
            enableDeliveryReport: true,
            tag: "alert"
        }
    );

    for (const sendResult of sendResults) {
        if (sendResult.successful) {
            console.log("Success: ", sendResult);
        } else {
            console.error("Something went wrong when trying to send this message: ", sendResult);
        }
    }

    context.res = {
        body: 'Sent SMS..'
    };

};

export default httpTrigger;