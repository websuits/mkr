📢 Use this project, [contribute](https://github.com/leadlion/themarketer) to it or open issues to help evolve it using [Store Discussion](https://github.com/vtex-apps/store-discussion).

# The Marketer

[![All Contributors](https://img.shields.io/badge/all_contributors-0-orange.svg?style=flat-square)](#contributors-)

The Marketer is an application that connects VTEX to [The Marketer](https://themarketer.com/) platform in order to send events, data about orders, products, categories, brands and users and thus allowing you to send newsletters and integrate loyalty programs.

## Installing The Marketer app

1. Access the **Apps** section in your account's admin page and look for the "The Marketer" box;
2. Then, click on the **Install** button;
3. Add the tracking key, rest API key, customer ID settings from The Marketer platform and configuration of the feed generation crons
4. Click on **Save**.

## Configure Master Data Triggers for Newsletter

0. Replace `{account}` with the actual account name in VTEX
1. Go to the https://{account}.ds.vtexcrm.com.br page > Triggers
2. We will create 3 triggers on the `CL` (Clients) entity with the following names:
   - Subscribe theMarketer (ON INSERT)
   - Subscribe theMarketer (ON UPDATE)
   - Unsubscribe theMarketer (ON UPDATE)

### Subscribe theMarketer (ON INSERT)

1. For the `Rules` tab, add a new filter on `Recebe Newsletter?`, condition `Igual`, value `True` and `Trigger rule` should be `Um registro for inserido`
2. For the `Schedule` tab, tick `Run ASAP`
3. For the `If positive` tab
   - Action should be `Send an HTTP request`
   - Method should be `POST`
   - URL: https://{account}.myvtex.com/themarketer/webhooks/subscribe
   - Content as JSON should be:

```json
{
  "email": "{!email}",
  "firstName": "{!firstName}",
  "lastName": "{!lastName}",
  "phone": "{!phone}"
}
```

### Subscribe theMarketer (ON UPDATE)

1. For the `Rules` tab, add a new filter on `Recebe Newsletter?`, condition `Igual`, value `True` and `Trigger rule` should be `Um registro for alterado`
2. For the `Schedule` tab, tick `Run ASAP`
3. For the `If positive` tab
   - Action should be `Send an HTTP request`
   - Method should be `POST`
   - URL: https://{account}.myvtex.com/themarketer/webhooks/subscribe
   - Content as JSON should be:

```json
{
  "email": "{!email}",
  "firstName": "{!firstName}",
  "lastName": "{!lastName}",
  "phone": "{!phone}"
}
```

### Unsubscribe theMarketer (ON UPDATE)

1. For the `Rules` tab, add a new filter on `Recebe Newsletter?`, condition `Igual`, value `False` and `Trigger rule` should be `Um registro for alterado`
2. For the `Schedule` tab, tick `Run ASAP`
3. For the `If positive` tab
   - Action should be `Send an HTTP request`
   - Method should be `POST`
   - URL: https://{account}.myvtex.com/themarketer/webhooks/unsubscribe
   - Content as JSON should be:

```json
{
  "email": "{!email}"
}
```

The reason why there are 3 triggers instead of 2 is that on the `If Negative` tab, the adding new action functionality doesn't work properly, therefor we need a third trigger for the unsubscribe event

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<table>
  <tr>
    <td align="center"><a href="https://github.com/razvanudream"><img src="https://avatars.githubusercontent.com/u/71461884?v=4" width="100px;" alt=""/><br /><sub><b>Razvan Udrea</b></sub></a><br /><a href="https://github.com/leadlion/themarketer/commits?author=razvanudream" title="Code">💻</a></td>
  </tr>
</table>

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
