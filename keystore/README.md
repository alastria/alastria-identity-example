# Role management
In the file [keystore.json](/keystore/keystore.json) we have the keystores of every entity and subject used in the examples. **Each entity has a different role**, as you can see in the table below:

|Name|Role|
|:--|--:|
|admin|SP+I|
|entity1|SP+I|
|entity2|SP|
|entity3|I|
|subject1| |
|subject2| |

Legend:
- _**SP** &rarr; Service Provider_
- _**I** &rarr; Issuer_

**Note**: The _admin_ account will **only** be used when creating the [first entity](/exampleFirstEntity). The following entities **must be created** by a **service provider** entity (_entity1_).