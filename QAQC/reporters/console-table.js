class ConsoleTableReporter {
  constructor() {
    this.rows = [];
  }

  onStepEnd(test, result, step) {
    if (step.category !== 'test.step') return;
    this.rows.push({
      Schema: test.titlePath()[1] || test.title,
      Action: step.title,
      Status: step.error ? 'FAIL' : 'PASS',
      Duration: `${step.duration} ms`
    });
  }

  onEnd(result) {
    console.log('\nQAQC CRUD REPORT');
    console.table(this.rows);
    console.log(`Overall: ${result.status.toUpperCase()}`);
  }
}

module.exports = ConsoleTableReporter;
