Hello 👋 , In this blog post, we are going to see how to send SMS using Azure Communication Service using Azure NodeJS SDKs. 

## Azure Communication Service

Azure Communication Services are cloud-based services with REST APIs and client library SDKs available to help you integrate communication into your applications. You can add communication features to your applications without much expertise in media tools.

Azure Communication Services supports various communication formats:

1. Voice and Video Calling
2. Rich Text Chat
3. SMS

## Scenario

I've explored the Azure Communication Service as an alternative to Twilio to send SMS. I've used Azure Communication SMS to send alerts to the user when the IoT Hub telemetry data is in the alert. The requirements are simple: 

1. Get a phone number.
2. Call an API or using SDK to send SMS when the IoT alert is triggered.
3. Get the SMS Delivery Event to audit or process.

## Prerequisites

- Create or use an existing Azure Account. To get a phone number, you've to use Paid Account. The free trial or MSDN accounts cannot get the phone numbers for SMS/Telephony services.
- [Create an Azure Communication Service](https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/create-communication-resource?tabs=windows&pivots=platform-azp)

## Get a Phone number

A phone number is assigned to your Communication Services resource. Phone numbers can be acquired and assigned to a Communication Services resource from the Azure Portal. Instructions on how to get a phone number using the Azure Portal can be found [here](https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/telephony-sms/get-phone-number?pivots=platform-azp).

You can select a phone number type - Local or Toll-Free number and the capabilities include inbound / outbound with a call or SMS>

![1.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1629861049952/Kyr1sErmj.png)

## Using Azure Node.js SDK to send SMS number

In a node.js project, install the @azure/communications-sms package. SmsClient is the primary interface for developers using this client library. It provides an asynchronous method to send SMS messages.

```bash
npm install @azure/communication-sms
```

### Authentication

You can directly use the connection string or using Azure Active Directory managed identity to authenticate the communication services when using it from the Azure services. 

```jsx
import { SmsClient } from "@azure/communication-sms";

const connectionString = `endpoint=https://<resource-name>.communication.azure.com/;accessKey=<Base64-Encoded-Key>`;
const client = new SmsClient(connectionString);
```

```jsx
import { DefaultAzureCredential } from "@azure/identity";
import { SmsClient } from "@azure/communication-sms";

const endpoint = "https://<resource-name>.communication.azure.com";
const credential = new DefaultAzureCredential();
const client = new SmsClient(endpoint, credential);
```

### Sending an SMS Message

To send an SMS message, call the send function from the SmsClient. You need to pass in a SmsSendRequest object. You may also pass an options object to specify whether the delivery report should be enabled and set custom tags for the report. An array of SmsSendResult is returned. A successful flag is used to validate if each individual message was sent successfully.

```jsx
const sendResults = await client.send(
  {
    from: fromPhoneNumber, 
    to: ["<to-phone-number-1>", "<to-phone-number-2>"],
    message: "Site #1 - Alert - Temperature is High!"
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
```

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1629861136760/1fCeV3VRI.png)

## Handling SMS Events for Delivery Report (or Inbound Message)

In the portal, select Events from the left menu of the Communication Services resource page. You can subscribe to specific events to tell Event Grid which of the SMS events you want to track, and where to send the events. 

Select the events you'd like to subscribe to from the dropdown menu. For SMS you'll have the option to choose SMS Received and SMS Delivery Report Received. I'm choosing SMS Delivery Report Events here to send it to ServiceBus Topic to process the delivery report and store the logs for audit.

![image.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1629861174636/zCzgZLZIX.png)

- `SMS Received` events are generated when the Communication Services phone number receives a text message. To trigger an event, just send a message from your phone to the phone number attached to your Communication Services resource.
- `SMS Delivery Report Received` events are generated when you send an SMS to a user using a Communication Services phone number. To trigger an event, you are required to enable `Delivery Report` in the options.

    ```jsx
    const sendResults = await client.send(
      {
        from: fromPhoneNumber, 
        to: ["<to-phone-number-1>", "<to-phone-number-2>"],
        message: "Site #1 - Alert - Temperature is High!"
      },
      {
        enableDeliveryReport: true,
        tag: "alert"
      }
    );
    ```

## Conclusion

Azure Communication Services is great for SMS integration for your applications - alert messages, schedule reminders, customer service scenarios, and other real communication needs. And also, the service supports Bulk messaging, Two-way conversations, Reliable Delivery, Analytics, and a Simple setup experience for adding SMS capability to your application.

I am going to write a lot about cloud, containers, IoT, and Devops. If you are interested in any of that, make sure to follow me if you haven’t already. Please follow me @ksivamuthu or check out my blogs at blog.sivamuthukumar.com.
