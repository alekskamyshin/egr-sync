const path = require('path');
const { parseFile } = require('../src/parsers/egrn.xml.parser');

describe('EGR XML parser', () => {
  it('parses a single record with expected INN/OGRNIP', async () => {
    const filePath = path.resolve(__dirname, '..', 'samples', 'egr_sample.xml');
    const records = [];

    const result = await parseFile(filePath, async (record) => {
      records.push(record);
    });

    expect(result.processed).toBe(1);
    expect(records).toHaveLength(1);
    expect(records[0].inn).toBe('333333333333');
    expect(records[0].ogrnip).toBe('777777777777777');
  });
});
