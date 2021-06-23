# MD5 Partitioning

create the threshold md5 cmp values for sharding / partitioning / bucketing

## Install

```shell
npm i md5-partitioning
```

## Example

```js
const { createPartitionThresholds } = require('md5-partitioning');

const thresholds = createPartitionThresholds(4);
const expected = [
  [
     null,
     "40000000000000000000000000000000"
  ],
  [
    "40000000000000000000000000000000",
    "80000000000000000000000000000000"
  ],
  [
    "80000000000000000000000000000000",
    "C0000000000000000000000000000000"
  ],
  [
    "C0000000000000000000000000000000",
    "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
  ]
];
require('assert').deepStrictEqual(thresholds, expected); // assert passes

// usage
for (const [min, max] of thresholds) {
  const query = `
    SELECT *
    FROM my_table
    WHERE my_md5_field <= ${max}
      ${min ? `AND my_md5_field > ${min}` : ''}
  `;
  
  console.log(query);
}
```
