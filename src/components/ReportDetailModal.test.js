const fs = require("fs");
const path = require("path");

test("labels cart detail updated_at as item update time, not payment time", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "ReportDetailModal.js"),
    "utf8"
  );

  expect(source).toContain("Item Updated At");
  expect(source).not.toContain("Paid Time");
  expect(source).toContain("{item.updated_at}");
});
