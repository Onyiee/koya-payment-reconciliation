// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js


const fs = require("fs");

const lines = fs
    .readFileSync("payments.jsonl", "utf8")
    .split(/\r?\n/);

const latestAttempts = new Map();

for (const line of lines) {
  if (!line.trim()) continue;

  let event;

  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }

  if (!event.txn_id || !event.ts) continue;

  const timestamp = Date.parse(event.ts);

  if (Number.isNaN(timestamp)) continue;

  const previous = latestAttempts.get(event.txn_id);

  if (!previous || timestamp > previous.timestamp) {
    latestAttempts.set(event.txn_id, {
      status: event.status,
      amount: Number(String(event.amount).replace(/,/g, "")),
      timestamp,
    });
  }
}

let total = 0;
let count = 0;

for (const payment of latestAttempts.values()) {
  if (payment.status === "success") {
    total += payment.amount;
    count++;
  }
}

const expected = parseInt(
    fs.readFileSync("expected.txt", "utf8").trim(),
    10
);

if (count !== expected) {
  console.log(
      `Check failed: counted ${count} successful payments, expected ${expected}.`
  );
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
