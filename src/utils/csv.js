/** @format */

import { Parser } from "json2csv";

export const getExpCsv = (fields, data) => {
  const opts = { fields };
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    // const buffer = Buffer.from(csv);
    return csv;
  } catch (err) {
    console.error(err);
    throw new err();
  }
};
