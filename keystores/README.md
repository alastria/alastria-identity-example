# Mocked identities

There are six different identities to play with the examples. In this directory you will find the six keystores used in the examples. **Each identity has a different role**, as you can see in the table below:

| Name     | Role                      |
| :------- | :------------------------ |
| admin    | Service Provider + Issuer |
| entity1  | Service Provider + Issuer |
| entity2  | Service Provider          |
| entity3  | Issuer                    |
| subject1 | Subject                   |
| subject2 | Subject                   |

The concepts that are being used in these examples are:

- **Entity** &rarr; Company or organization (legal person). An entity can be one or both:

  - **Sercice Provider** &rarr; Entity which requests information from a subject, so it creates Presentation Requests and receives Presentations.
  - **Issuer** &rarr; It can help anyone to create a new identity. Also this kind of entity can emits certified information about a subject, so it creates Credentials.

- **Subject** &rarr; Person (natural or legal) who has information certified by an issuer and sends it to a service provider, so it receives credentials and creates presentations. It is the information owner. This information is saved and controlled from a wallet.
- **Admin** &rarr; Root identity which deploys the Smart Contracts and owns them. It is just used when creating the [first entity](/exampleFirstEntity). The following entities **must be created** by an **issuer** entity (in this example, _entity1_).
