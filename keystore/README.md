# Mocked identities
There are six different identities to play with the examples. In the file [keystore.json](/keystore/keystore.json) you will find the six keystores associated to them. **Each identity has a different role**, as you can see in the table below:

|Name|Role|
|:--|--:|
|admin|Service Provider + Issuer|
|entity1|Service Provider + Issuer|
|entity2|Service Provider|
|entity3|Issuer|
|subject1|Subject |
|subject2|Subject |

The used concepts are:
- **Entity** &rarr; Company or organization (legal person) which can be one or both:

  - **Sercice Provider** &rarr; Entity which requests information from a subject, so it creates Presentation Requests and receives Presentations. Also, it can help anyone to create a new identity.

  - **Issuer** &rarr; Entity which emits certified information about a subject, so it creates Credentials.

- **Subject** &rarr; Person (natural or legal) who has information certified by an issuer and sends it to a service provider, so it receives credentials and creates presentations. It is the information owner. This information is saved and controlled from a wallet.
- **Admin** &rarr; Abstract identity which deploys the Smart Contracts and own them. It is just used when creating the [first entity](/exampleFirstEntity). The following entities **must be created** by a **service provider** entity (in this example, _entity1_).
